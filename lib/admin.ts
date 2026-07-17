import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminUser = {
    id: string;
    email: string | null;
};

export class AdminAuthError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

const loadAdminProfile = cache(async () => {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, isAdmin: false };
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return { user, isAdmin: profile?.role === "admin" };
});

/** For Server Components / layouts — redirects instead of throwing. */
export async function requireAdminUser(): Promise<AdminUser> {
    const { user, isAdmin } = await loadAdminProfile();

    if (!user) {
        redirect("/auth/sign-in");
    }

    if (!isAdmin) {
        redirect("/dashboard");
    }

    return { id: user.id, email: user.email ?? null };
}

/** For Route Handlers — throws AdminAuthError so callers can map it to a JSON response. */
export async function requireAdminApiUser(): Promise<AdminUser> {
    const { user, isAdmin } = await loadAdminProfile();

    if (!user) {
        throw new AdminAuthError("You must be signed in.", 401);
    }

    if (!isAdmin) {
        throw new AdminAuthError("Admin access required.", 403);
    }

    return { id: user.id, email: user.email ?? null };
}

export function adminAuthErrorResponse(error: unknown) {
    if (error instanceof AdminAuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return null;
}
