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
        const adminUser = await requireAdminApiUser();

        const { id } = await context.params;
        const body = await request.json();

        const isBlocked = body.isBlocked;

        if (typeof isBlocked !== "boolean") {
            return NextResponse.json(
                { error: "Invalid isBlocked value." },
                { status: 400 }
            );
        }

        if (id === adminUser.id && isBlocked) {
            return NextResponse.json(
                { error: "You cannot block your own account." },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                is_blocked: isBlocked
            })
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            isBlocked
        });
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
                        : "Could not update block status."
            },
            { status: 500 }
        );
    }
}
