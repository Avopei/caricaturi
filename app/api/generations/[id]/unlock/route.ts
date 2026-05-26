import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(_request: Request, context: RouteContext) {
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

        const { data: generation, error: findError } = await supabaseAdmin
            .from("generations")
            .select("id,user_id")
            .eq("id", id)
            .single();

        if (findError || !generation) {
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

        const { error: updateError } = await supabaseAdmin
            .from("generations")
            .update({
                payment_status: "paid",
                paid_at: new Date().toISOString()
            })
            .eq("id", id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            success: true,
            paymentStatus: "paid"
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not unlock this generation."
            },
            { status: 500 }
        );
    }
}