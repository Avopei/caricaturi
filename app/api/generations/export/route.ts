import { NextResponse } from "next/server";
import { createSignedUrl } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type GenerationExportRow = {
    id: string;
    original_image_path: string | null;
    preview_image_path: string | null;
    final_image_path: string | null;
    style: string | null;
    intensity: string | null;
    payment_status: string | null;
    demo: boolean | null;
    status: string | null;
    feedback_rating: string | null;
    created_at: string;
};

type GenerationExportItem = GenerationExportRow & {
    original_image_url: string | null;
    preview_image_url: string | null;
    final_image_url: string | null;
};

async function signedUrlOrNull(path: string | null): Promise<string | null> {
    if (!path) {
        return null;
    }

    return createSignedUrl(path);
}

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("generations")
            .select(
                "id, original_image_path, preview_image_path, final_image_path, style, intensity, payment_status, demo, status, feedback_rating, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .returns<GenerationExportRow[]>();

        if (error) {
            throw new Error(error.message);
        }

        const generations: GenerationExportItem[] = await Promise.all(
            (data || []).map(async (generation) => ({
                ...generation,
                original_image_url: await signedUrlOrNull(generation.original_image_path),
                preview_image_url: await signedUrlOrNull(generation.preview_image_path),
                final_image_url: await signedUrlOrNull(generation.final_image_path)
            }))
        );

        return new NextResponse(JSON.stringify({ generations }, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="caricature-history-${user.id}.json"`,
                "Cache-Control": "private, no-store"
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not export generation history."
            },
            { status: 500 }
        );
    }
}
