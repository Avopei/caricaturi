import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

    if (error || !profile || profile.plan !== "admin") {
        throw new Error("FORBIDDEN");
    }

    return user;
}

export async function GET() {
    try {
        await requireAdmin();

        const { data, error } = await supabaseAdmin
            .from("generations")
            .select(
                `
        id,
        user_id,
        original_image_path,
        final_image_path,
        preview_image_path,
        style,
        intensity,
        prompt_used,
        variation_token,
        feedback_rating,
        download_count,
        selected_for_training,
        admin_quality_rating,
        admin_notes,
        created_at
      `
            )
            .eq("selected_for_training", true)
            .order("admin_quality_rating", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        const dataset = await Promise.all(
            (data || []).map(async (generation) => ({
                id: generation.id,
                userId: generation.user_id,
                originalImage: generation.original_image_path
                    ? await createSignedUrl(generation.original_image_path)
                    : null,
                finalImage: generation.final_image_path
                    ? await createSignedUrl(generation.final_image_path)
                    : null,
                previewImage: generation.preview_image_path
                    ? await createSignedUrl(generation.preview_image_path)
                    : null,
                style: generation.style,
                intensity: generation.intensity,
                promptUsed: generation.prompt_used,
                variationToken: generation.variation_token,
                feedbackRating: generation.feedback_rating,
                downloadCount: generation.download_count || 0,
                selectedForTraining: generation.selected_for_training,
                adminQualityRating: generation.admin_quality_rating,
                adminNotes: generation.admin_notes,
                createdAt: generation.created_at
            }))
        );

        return NextResponse.json({
            count: dataset.length,
            dataset
        });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message === "FORBIDDEN") {
            return NextResponse.json(
                { error: "Admin access required." },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not export LoRA dataset."
            },
            { status: 500 }
        );
    }
}