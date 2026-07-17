import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        await requireAdminApiUser();

        const { id } = await context.params;
        const body = await request.json();

        const limit = body.limit;

        if (limit !== null && (typeof limit !== "number" || limit < 0 || !Number.isInteger(limit))) {
            return NextResponse.json(
                { error: "Limit must be a non-negative integer, or null to reset to the plan default." },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                free_generations_limit: limit
            })
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            limit
        });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Could not update limit."
            },
            { status: 500 }
        );
    }
}
