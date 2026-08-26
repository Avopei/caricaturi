import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserPlan, UserRole } from "@/types/caricature";

export type ProfileRow = {
    id: string;
    plan: UserPlan;
    role: UserRole;
    is_blocked: boolean;
    free_generations_used: number;
    free_generations_limit: number | null;
};

const PROFILE_COLUMNS =
    "id, plan, role, is_blocked, free_generations_used, free_generations_limit";

/** Only "free" and "pro" are real plan tiers; any other stored value (e.g. a
 *  legacy "studio" row) is treated as "pro" so it can never crash a limit
 *  lookup or a plan selector. */
function normalizePlan(plan: string): UserPlan {
    return plan === "free" ? "free" : "pro";
}

export class GenerationNotAllowedError extends Error {
    status: number;

    constructor(message: string, status = 403) {
        super(message);
        this.status = status;
    }
}

export async function getPlanLimits(): Promise<{
    free: number;
    pro: number;
}> {
    const { data, error } = await supabaseAdmin
        .from("app_settings")
        .select("free_plan_limit, pro_plan_limit")
        .eq("id", 1)
        .single();

    if (error || !data) {
        return { free: 3, pro: 999 };
    }

    return {
        free: data.free_plan_limit,
        pro: data.pro_plan_limit
    };
}

export async function effectiveLimit(profile: ProfileRow): Promise<number> {
    if (profile.free_generations_limit !== null) {
        return profile.free_generations_limit;
    }

    const limits = await getPlanLimits();

    return limits[profile.plan];
}

/** Admins bypass usage limits entirely; every other plan is metered against app_settings. */
export function isAdmin(profile: Pick<ProfileRow, "role">): boolean {
    return profile.role === "admin";
}

export async function remainingGenerations(profile: ProfileRow): Promise<number> {
    if (isAdmin(profile)) {
        return 999;
    }

    const limit = await effectiveLimit(profile);

    return Math.max(0, limit - profile.free_generations_used);
}

export async function assertCanGenerate(profile: ProfileRow): Promise<void> {
    if (profile.is_blocked) {
        throw new GenerationNotAllowedError("Your account has been blocked.");
    }

    if (isAdmin(profile)) {
        return;
    }

    const limit = await effectiveLimit(profile);

    if (profile.free_generations_used >= limit) {
        throw new GenerationNotAllowedError(
            "You've reached your plan limit. Upgrade to continue."
        );
    }
}

/** Free-tier, non-admin usage is metered; everyone else generates without incrementing the counter. */
export async function incrementUsageIfMetered(profile: ProfileRow): Promise<void> {
    if (isAdmin(profile) || profile.plan !== "free") {
        return;
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ free_generations_used: profile.free_generations_used + 1 })
        .eq("id", profile.id);

    if (error) {
        console.error("incrementUsageIfMetered error:", error.message);
    }
}

/**
 * Loads a profile, lazily creating it if the sign-up trigger hasn't run for
 * this user yet (e.g. accounts created before the migration was applied).
 */
export async function getOrCreateProfile(
    userId: string,
    email?: string | null
): Promise<ProfileRow> {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", userId)
        .single();

    if (!error && data) {
        return { ...data, plan: normalizePlan(data.plan) } as ProfileRow;
    }

    const { data: created, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
            id: userId,
            email: email ?? undefined,
            plan: "free",
            free_generations_used: 0
        })
        .select(PROFILE_COLUMNS)
        .single();

    if (createError || !created) {
        throw new Error(createError?.message || "Could not load or create profile.");
    }

    return { ...created, plan: normalizePlan(created.plan) } as ProfileRow;
}
