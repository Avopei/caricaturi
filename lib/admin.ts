import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";

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

/** For Server Components / layouts — redirects instead of throwing. */
export async function requireAdminUser(): Promise<AdminUser> {
    const profile = await getProfile();

    if (!profile) {
        redirect("/auth/sign-in");
    }

    if (profile.role !== "admin") {
        redirect("/dashboard");
    }

    return { id: profile.id, email: profile.email };
}

/** For Route Handlers — throws AdminAuthError so callers can map it to a JSON response. */
export async function requireAdminApiUser(): Promise<AdminUser> {
    const profile = await getProfile();

    if (!profile) {
        throw new AdminAuthError("You must be signed in.", 401);
    }

    if (profile.role !== "admin") {
        throw new AdminAuthError("Admin access required.", 403);
    }

    return { id: profile.id, email: profile.email };
}

export function adminAuthErrorResponse(error: unknown) {
    if (error instanceof AdminAuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return null;
}
