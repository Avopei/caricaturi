import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        const generations = await Promise.all(
            data.map(async (generation) => ({
                id: generation.id,
                originalImage: generation.original_image_path
                    ? await createSignedUrl(generation.original_image_path)
                    : null,
                previewImage: generation.preview_image_path
                    ? await createSignedUrl(generation.preview_image_path)
                    : null,
                style: generation.style,
                intensity: generation.intensity,
                paymentStatus: generation.payment_status,
                demo: generation.demo,
                createdAt: generation.created_at,
                feedbackRating: generation.feedback_rating,
                quality: generation.quality,
                watermarkType: generation.watermark_type,
                isPro: generation.is_pro,
                generationMode: generation.generation_mode,
                modelProvider: generation.model_provider,
                modelName: generation.model_name
            }))
        );

        return NextResponse.json({
            generations
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load generation history."
            },
            { status: 500 }
        );
    }
}