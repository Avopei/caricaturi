import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
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

        const { error } = await supabaseAdmin.from("pro_waitlist").upsert(
            {
                user_id: user.id,
                email: user.email || "",
                source: "account_page"
            },
            {
                onConflict: "user_id"
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not join the Pro waitlist."
            },
            { status: 500 }
        );
    }
}