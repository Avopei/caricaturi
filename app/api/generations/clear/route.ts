import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteFilesFromStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function DELETE() {
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

        const { data: generations, error: findError } = await supabaseAdmin
            .from("generations")
            .select("id, original_image_path, preview_image_path, final_image_path")
            .eq("user_id", user.id);

        if (findError) {
            throw new Error(findError.message);
        }

        const paths =
            generations?.flatMap((generation) => [
                generation.original_image_path,
                generation.preview_image_path,
                generation.final_image_path
            ]) || [];

        await deleteFilesFromStorage(paths);

        const { error: deleteError } = await supabaseAdmin
            .from("generations")
            .delete()
            .eq("user_id", user.id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Could not clear history."
            },
            { status: 500 }
        );
    }
}