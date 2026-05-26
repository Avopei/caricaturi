import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserPlan } from "@/types/caricature";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isValidPlan(value: unknown): value is UserPlan {
    return value === "free" || value === "pro" || value === "admin";
}

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

    if (error || !profile || profile.plan !== "admin") {
        throw new Error("FORBIDDEN");
    }

    return user;
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const adminUser = await requireAdmin();

        const { id } = await context.params;
        const body = await request.json();

        const plan = body.plan;

        if (!isValidPlan(plan)) {
            return NextResponse.json(
                { error: "Invalid plan value." },
                { status: 400 }
            );
        }

        if (id === adminUser.id && plan !== "admin") {
            return NextResponse.json(
                { error: "You cannot downgrade your own admin account." },
                { status: 403 }
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
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message === "FORBIDDEN") {
            return NextResponse.json(
                { error: "Admin access required." },
                { status: 403 }
            );
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