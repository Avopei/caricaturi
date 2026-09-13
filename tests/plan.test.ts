import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSingle = vi.fn();
const mockUpdateEq = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === "app_settings") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSingle,
            })),
          })),
        };
      }

      if (table === "profiles") {
        return {
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  },
}));

import {
  GenerationNotAllowedError,
  assertCanGenerate,
  effectiveLimit,
  getPlanLimits,
  incrementUsageIfMetered,
  isAdmin,
  remainingGenerations,
  type ProfileRow
} from "@/lib/plan";

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

describe("lib/plan.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("effectiveLimit", () => {
    it("returnează free_generations_limit dacă este setat", async () => {
      const mockProfile: ProfileRow = {
        id: "user-123",
        plan: "free",
        role: "user",
        is_blocked: false,
        free_generations_used: 0,
        free_generations_limit: 15
      };

      const limit = await effectiveLimit(mockProfile);

      expect(limit).toBe(15);
      expect(mockSingle).not.toHaveBeenCalled();
    });

    it("preia limita din setările planului dacă free_generations_limit este null (plan pro)", async () => {
      mockSingle.mockResolvedValue({
        data: {
          free_plan_limit: 7,
          pro_plan_limit: 100,
          studio_plan_limit: 500,
        },
        error: null,
      });

      const mockProfile: ProfileRow = {
        id: "user-456",
        plan: "pro",
        role: "user",
        is_blocked: false,
        free_generations_used: 2,
        free_generations_limit: null
      };

      const limit = await effectiveLimit(mockProfile);

      expect(limit).toBe(100);
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });

    it("preia limita din setările planului dacă free_generations_limit este null (plan free)", async () => {
      mockSingle.mockResolvedValue({
        data: {
          free_plan_limit: 3,
          pro_plan_limit: 999,
          studio_plan_limit: 999,
        },
        error: null,
      });

      const mockProfile = makeProfile({ plan: "free", free_generations_limit: null });

      const limit = await effectiveLimit(mockProfile);

      expect(limit).toBe(3);
    });

    it("preia limita de fallback din cod când free_generations_limit este null și baza de date dă eroare", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error("DB Error"),
      });

      const mockProfile: ProfileRow = {
        id: "user-789",
        plan: "free",
        role: "user",
        is_blocked: false,
        free_generations_used: 0,
        free_generations_limit: null,
      };

      const limit = await effectiveLimit(mockProfile);

      expect(limit).toBe(3);
    });
  });

  describe("isAdmin", () => {
    it("recunoaște un admin", () => {
      expect(isAdmin({ role: "admin" })).toBe(true);
    });

    it("nu confundă un user cu un admin", () => {
      expect(isAdmin({ role: "user" })).toBe(false);
    });
  });

  describe("getPlanLimits", () => {
    it("returnează limitele implicite de fallback când baza de date returnează eroare", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error("Database unreachable / connection error"),
      });

      const limits = await getPlanLimits();

      expect(limits).toEqual({
        free: 3,
        pro: 999,
        studio: 999,
      });
    });

    it("returnează limitele implicite de fallback când data este null", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const limits = await getPlanLimits();

      expect(limits).toEqual({
        free: 3,
        pro: 999,
        studio: 999,
      });
    });

    it("returnează limitele configurate când baza de date răspunde cu succes", async () => {
      mockSingle.mockResolvedValue({
        data: {
          free_plan_limit: 5,
          pro_plan_limit: 50,
          studio_plan_limit: 200,
        },
        error: null,
      });

      const limits = await getPlanLimits();

      expect(limits).toEqual({
        free: 5,
        pro: 50,
        studio: 200,
      });
    });
  });

  describe("remainingGenerations", () => {
    it("returnează 999 pentru admini, fără să consulte app_settings", async () => {
      const profile = makeProfile({ role: "admin", free_generations_used: 1000 });

      await expect(remainingGenerations(profile)).resolves.toBe(999);
      expect(mockSingle).not.toHaveBeenCalled();
    });

    it("returnează diferența dintre limită și numărul de generări folosite", async () => {
      const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 1 });

      await expect(remainingGenerations(profile)).resolves.toBe(2);
    });

    it("nu coboară sub 0 când numărul folosit depășește limita", async () => {
      const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 5 });

      await expect(remainingGenerations(profile)).resolves.toBe(0);
    });
  });

  describe("assertCanGenerate", () => {
    it("aruncă eroare pentru un cont blocat, chiar dacă e admin", async () => {
      const profile = makeProfile({ is_blocked: true, role: "admin" });

      await expect(assertCanGenerate(profile)).rejects.toMatchObject(
        new GenerationNotAllowedError("Your account has been blocked.")
      );
    });

    it("permite adminilor să treacă peste limita de generări", async () => {
      const profile = makeProfile({
        role: "admin",
        free_generations_limit: 1,
        free_generations_used: 100
      });

      await expect(assertCanGenerate(profile)).resolves.toBeUndefined();
    });

    it("aruncă GenerationNotAllowedError când un non-admin și-a atins limita", async () => {
      const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 3 });

      await expect(assertCanGenerate(profile)).rejects.toThrow(
        "You've reached your plan limit. Upgrade to continue."
      );
    });

    it("se rezolvă fără eroare când un non-admin este sub limită", async () => {
      const profile = makeProfile({ free_generations_limit: 3, free_generations_used: 2 });

      await expect(assertCanGenerate(profile)).resolves.toBeUndefined();
    });
  });

  describe("incrementUsageIfMetered", () => {
    it("incrementează numărul de generări pentru un utilizator free metered", async () => {
      mockUpdateEq.mockResolvedValue({ error: null });

      const profile = makeProfile({ plan: "free", free_generations_used: 2 });

      await incrementUsageIfMetered(profile);

      expect(mockUpdateEq).toHaveBeenCalledTimes(1);
    });

    it("nu face nimic pentru admini", async () => {
      const profile = makeProfile({ role: "admin", plan: "free" });

      await incrementUsageIfMetered(profile);

      expect(mockUpdateEq).not.toHaveBeenCalled();
    });

    it("nu face nimic pentru planuri diferite de free", async () => {
      const profile = makeProfile({ role: "user", plan: "pro" });

      await incrementUsageIfMetered(profile);

      expect(mockUpdateEq).not.toHaveBeenCalled();
    });
  });
});
