import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserPlan, UserRole } from "@/types/caricature";

export type Profile = {
    id: string;
    email: string | null;
    plan: UserPlan;
    role: UserRole;
    isBlocked: boolean;
    freeGenerationsUsed: number;
    freeGenerationsLimit: number | null;
};

const PROFILE_COLUMNS =
    "id, email, plan, role, is_blocked, free_generations_used, free_generations_limit";

/** Only "free" and "pro" are real plan tiers; any other stored value (e.g. a
 *  legacy "studio" row) is treated as "pro" so it can never crash a limit
 *  lookup or a plan selector. */
function normalizePlan(plan: string): UserPlan {
    return plan === "free" ? "free" : "pro";
}

/**
 * The single source of truth for "who is the current user, and what is their
 * profile" — used by the dashboard nav (admin link), the account page, and
 * the admin guard, so they can never disagree. Returns null only when there
 * is no signed-in session. Cached per-request via React's cache().
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .single();

    if (error || !data) {
        console.warn(
            `[getProfile] No profiles row for user ${user.id} (${user.email ?? "no email"}). ` +
            `Query result: ${error ? error.message : "row not found"}. ` +
            "Falling back to a default free/user profile for this request — if this " +
            "user is expected to be admin/pro, check the profiles table directly and " +
            "the profiles_select_own RLS policy."
        );

        return {
            id: user.id,
            email: user.email ?? null,
            plan: "free",
            role: "user",
            isBlocked: false,
            freeGenerationsUsed: 0,
            freeGenerationsLimit: null
        };
    }

    return {
        id: data.id,
        email: data.email,
        plan: normalizePlan(data.plan),
        role: data.role,
        isBlocked: data.is_blocked,
        freeGenerationsUsed: data.free_generations_used,
        freeGenerationsLimit: data.free_generations_limit
    };
});
