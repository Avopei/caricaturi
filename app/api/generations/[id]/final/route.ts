import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

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

        const { data: generation, error } = await supabaseAdmin
            .from("generations")
            .select("id,user_id,final_image_path,payment_status")
            .eq("id", id)
            .single();

        if (error || !generation) {
            return NextResponse.json(
                { error: "Generation was not found." },
                { status: 404 }
            );
        }

        if (generation.user_id !== user.id) {
            return NextResponse.json(
                { error: "You do not have access to this generation." },
                { status: 403 }
            );
        }

        if (generation.payment_status !== "paid") {
            return NextResponse.json(
                { error: "This image has not been unlocked yet." },
                { status: 403 }
            );
        }

        if (!generation.final_image_path) {
            return NextResponse.json(
                { error: "The final image does not exist." },
                { status: 404 }
            );
        }

        const finalImage = await createSignedUrl(generation.final_image_path);

        return NextResponse.json({
            finalImage
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load the final image."
            },
            { status: 500 }
        );
    }
}