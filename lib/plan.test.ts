import { beforeEach, describe, expect, it, vi } from "vitest";

const singleMock = vi.fn();
const updateEqMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
    supabaseAdmin: {
        from: vi.fn((table: string) => {
            if (table === "app_settings") {
                return {
                    select: () => ({
                        eq: () => ({
                            single: singleMock
                        })
                    })
                };
            }

            if (table === "profiles") {
                return {
                    update: () => ({
                        eq: updateEqMock
                    })
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        })
    }
}));

const {
    GenerationNotAllowedError,
    assertCanGenerate,
    effectiveLimit,
    getPlanLimits,
    incrementUsageIfMetered,
    isAdmin,
    remainingGenerations
} = await import("@/lib/plan");

import type { ProfileRow } from "@/lib/plan";

function makeProfile(overrides: Partial<ProfileRow> = {}): ProfileRow {
    return {
        id: "user-1",
        plan: "free",
        role: "user",
        is_blocked: false,
        free_generations_used: 0,
        free_generations_limit: null,
        ...overrides
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getPlanLimits", () => {
    it("returns the configured limits from app_settings", async () => {
        singleMock.mockResolvedValue({
            data: { free_plan_limit: 5, pro_plan_limit: 500 },
            error: null
        });

        await expect(getPlanLimits()).resolves.toEqual({ free: 5, pro: 500 });
    });

    it("falls back to { free: 3, pro: 999 } when app_settings query errors", async () => {
        singleMock.mockResolvedValue({
            data: null,
            error: { message: "connection failed" }
        });

        await expect(getPlanLimits()).resolves.toEqual({ free: 3, pro: 999 });
    });

    it("falls back to { free: 3, pro: 999 } when app_settings row is missing", async () => {
        singleMock.mockResolvedValue({ data: null, error: null });

        await expect(getPlanLimits()).resolves.toEqual({ free: 3, pro: 999 });
    });
});

describe("effectiveLimit", () => {
    it("uses the profile's per-user override without hitting app_settings", async () => {
        const profile = makeProfile({ free_generations_limit: 7 });

        await expect(effectiveLimit(profile)).resolves.toBe(7);
        expect(singleMock).not.toHaveBeenCalled();
    });

    it("falls back to the plan limit from app_settings for a free profile", async () => {
        singleMock.mockResolvedValue({
            data: { free_plan_limit: 3, pro_plan_limit: 999 },
            error: null
        });

        const profile = makeProfile({ plan: "free", free_generations_limit: null });

        await expect(effectiveLimit(profile)).resolves.toBe(3);
    });

    it("falls back to the plan limit from app_settings for a pro profile", async () => {
        singleMock.mockResolvedValue({
            data: { free_plan_limit: 3, pro_plan_limit: 999 },
            error: null
        });

        const profile = makeProfile({ plan: "pro", free_generations_limit: null });

        await expect(effectiveLimit(profile)).resolves.toBe(999);
    });
});

describe("isAdmin", () => {
    it("is true only for the admin role", () => {
        expect(isAdmin({ role: "admin" })).toBe(true);
        expect(isAdmin({ role: "user" })).toBe(false);
    });
});

describe("remainingGenerations", () => {
    it("returns 999 for admins without consulting app_settings", async () => {
        const profile = makeProfile({ role: "admin", free_generations_used: 1000 });

        await expect(remainingGenerations(profile)).resolves.toBe(999);
        expect(singleMock).not.toHaveBeenCalled();
    });

    it("returns the difference between the limit and usage", async () => {
        const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 1 });

        await expect(remainingGenerations(profile)).resolves.toBe(2);
    });

    it("clamps at 0 when usage exceeds the limit", async () => {
        const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 5 });

        await expect(remainingGenerations(profile)).resolves.toBe(0);
    });
});

describe("assertCanGenerate", () => {
    it("throws for a blocked account, even for admins", async () => {
        const profile = makeProfile({ is_blocked: true, role: "admin" });

        await expect(assertCanGenerate(profile)).rejects.toMatchObject(
            new GenerationNotAllowedError("Your account has been blocked.")
        );
    });

    it("allows admins to bypass usage limits", async () => {
        const profile = makeProfile({
            role: "admin",
            free_generations_limit: 1,
            free_generations_used: 100
        });

        await expect(assertCanGenerate(profile)).resolves.toBeUndefined();
    });

    it("throws GenerationNotAllowedError when a non-admin has hit their limit", async () => {
        const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 3 });

        await expect(assertCanGenerate(profile)).rejects.toThrow(
            "You've reached your plan limit. Upgrade to continue."
        );
    });

    it("resolves when a non-admin is under their limit", async () => {
        const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 2 });

        await expect(assertCanGenerate(profile)).resolves.toBeUndefined();
    });
});

describe("incrementUsageIfMetered", () => {
    it("increments usage for a metered free-plan user", async () => {
        updateEqMock.mockResolvedValue({ error: null });

        const profile = makeProfile({ plan: "free", free_generations_used: 2 });

        await incrementUsageIfMetered(profile);

        expect(updateEqMock).toHaveBeenCalledTimes(1);
    });

    it("does nothing for admins", async () => {
        const profile = makeProfile({ role: "admin", plan: "free" });

        await incrementUsageIfMetered(profile);

        expect(updateEqMock).not.toHaveBeenCalled();
    });

    it("does nothing for non-free plans", async () => {
        const profile = makeProfile({ role: "user", plan: "pro" });

        await incrementUsageIfMetered(profile);

        expect(updateEqMock).not.toHaveBeenCalled();
    });
});
