import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { downloadFileFromStorage } from "@/lib/storage";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type GenerationRow = {
    id: string;
    user_id: string;
    final_image_path: string | null;
    payment_status: string | null;
};

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const supabase = await createClient();

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    error: "You must be signed in."
                },
                {
                    status: 401
                }
            );
        }

        const { data: generation, error: generationError } = await supabaseAdmin
            .from("generations")
            .select("id, user_id, final_image_path, payment_status")
            .eq("id", id)
            .eq("user_id", user.id)
            .single<GenerationRow>();

        if (generationError || !generation) {
            return NextResponse.json(
                {
                    error: "Generation not found."
                },
                {
                    status: 404
                }
            );
        }

        if (generation.payment_status !== "paid") {
            return NextResponse.json(
                {
                    error: "This image is locked. Unlock it before downloading."
                },
                {
                    status: 403
                }
            );
        }

        if (!generation.final_image_path) {
            return NextResponse.json(
                {
                    error: "Final image is missing."
                },
                {
                    status: 404
                }
            );
        }

        const file = await downloadFileFromStorage(generation.final_image_path);

        // Tracking download count. If this fails, download still works.
        try {
            await supabaseAdmin
                .from("generations")
                .update({
                    download_count: 1,
                    last_downloaded_at: new Date().toISOString()
                })
                .eq("id", generation.id)
                .is("download_count", null);
        } catch (trackingError) {
            console.error("DOWNLOAD_TRACKING_FIRST_SET_ERROR:", trackingError);
        }

        try {
            const { data: currentGeneration } = await supabaseAdmin
                .from("generations")
                .select("download_count")
                .eq("id", generation.id)
                .single();

            const currentDownloadCount =
                typeof currentGeneration?.download_count === "number"
                    ? currentGeneration.download_count
                    : 0;

            await supabaseAdmin
                .from("generations")
                .update({
                    download_count: currentDownloadCount + 1,
                    last_downloaded_at: new Date().toISOString()
                })
                .eq("id", generation.id);
        } catch (trackingError) {
            console.error("DOWNLOAD_TRACKING_ERROR:", trackingError);
        }

        return new NextResponse(new Uint8Array(file.buffer), {
            status: 200,
            headers: {
                "Content-Type": file.contentType,
                "Content-Disposition": `attachment; filename="caricature-${generation.id}.png"`,
                "Cache-Control": "private, no-store"
            }
        });
    } catch (error) {
        console.error("DOWNLOAD_ERROR:", error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Could not download image."
            },
            {
                status: 500
            }
        );
    }
}
