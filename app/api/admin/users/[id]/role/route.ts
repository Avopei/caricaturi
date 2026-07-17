import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";
import type { UserRole } from "@/types/caricature";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isValidRole(value: unknown): value is UserRole {
    return value === "user" || value === "admin";
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const adminUser = await requireAdminApiUser();

        const { id } = await context.params;
        const body = await request.json();

        const role = body.role;

        if (!isValidRole(role)) {
            return NextResponse.json(
                { error: "Invalid role value." },
                { status: 400 }
            );
        }

        if (id === adminUser.id && role !== "admin") {
            return NextResponse.json(
                { error: "You cannot demote your own admin account." },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                role
            })
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            role
        });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Could not update role."
            },
            { status: 500 }
        );
    }
}
