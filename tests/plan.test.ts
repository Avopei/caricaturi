import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSingle = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
    })),
  },
}));

import { effectiveLimit, isAdmin, getPlanLimits, type ProfileRow } from "@/lib/plan";

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

    it("preia limita din setările planului dacă free_generations_limit este null", async () => {
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
});