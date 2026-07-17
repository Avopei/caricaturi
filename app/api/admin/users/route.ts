import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
    try {
        await requireAdminApiUser();

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select(
                "id, email, plan, role, is_blocked, free_generations_used, free_generations_limit, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            users: data || []
        });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Could not load users."
            },
            { status: 500 }
        );
    }
}
