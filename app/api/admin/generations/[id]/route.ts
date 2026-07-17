import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";
import { deleteFilesFromStorage } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(request: Request, context: RouteContext) {
    try {
        await requireAdminApiUser();

        const { id } = await context.params;

        const { data: generation, error: fetchError } = await supabaseAdmin
            .from("generations")
            .select("original_image_path, preview_image_path, final_image_path")
            .eq("id", id)
            .single();

        if (fetchError || !generation) {
            return NextResponse.json(
                { error: "Generation was not found." },
                { status: 404 }
            );
        }

        const storagePaths = [
            generation.original_image_path,
            generation.preview_image_path,
            generation.final_image_path
        ].filter((path): path is string => Boolean(path) && !path!.startsWith("http"));

        if (storagePaths.length > 0) {
            try {
                await deleteFilesFromStorage(storagePaths);
            } catch (error) {
                console.error("ADMIN_DELETE_GENERATION_STORAGE_ERROR", error);
            }
        }

        const { error: deleteError } = await supabaseAdmin
            .from("generations")
            .delete()
            .eq("id", id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not delete generation."
            },
            { status: 500 }
        );
    }
}
