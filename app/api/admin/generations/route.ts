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
                "id, user_id, preview_image_path, style, intensity, payment_status, feedback_rating, download_count, selected_for_training, admin_quality_rating, admin_notes, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(30);

        if (error) {
            throw new Error(error.message);
        }

        const generations = await Promise.all(
            (data || []).map(async (generation) => ({
                id: generation.id,
                userId: generation.user_id,
                previewImage: generation.preview_image_path
                    ? await createSignedUrl(generation.preview_image_path)
                    : null,
                style: generation.style,
                intensity: generation.intensity,
                paymentStatus: generation.payment_status,
                feedbackRating: generation.feedback_rating,
                downloadCount: generation.download_count || 0,
                selectedForTraining: Boolean(generation.selected_for_training),
                adminQualityRating: generation.admin_quality_rating,
                adminNotes: generation.admin_notes,
                createdAt: generation.created_at
            }))
        );

        return NextResponse.json({
            generations
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
                        : "Could not load admin generations."
            },
            { status: 500 }
        );
    }
}