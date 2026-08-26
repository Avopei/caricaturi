import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";
import type { UserPlan } from "@/types/caricature";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isValidPlan(value: unknown): value is UserPlan {
    return value === "free" || value === "pro";
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        await requireAdminApiUser();

        const { id } = await context.params;
        const body = await request.json();

        const plan = body.plan;

        if (!isValidPlan(plan)) {
            return NextResponse.json(
                { error: "Invalid plan value." },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                plan
            })
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            plan
        });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Could not update plan."
            },
            { status: 500 }
        );
    }
}
