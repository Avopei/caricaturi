import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("react", () => ({
  cache: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
}));

const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockProfileSingle,
        })),
      })),
    })),
  },
}));

import {
  requireAdminUser,
  requireAdminApiUser,
  AdminAuthError,
  adminAuthErrorResponse,
} from "@/lib/admin";

describe("lib/admin.ts — cine e admin, cine nu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAdminUser (Server Components / UI)", () => {
    it("permite accesul dacă utilizatorul este autentificat și are rolul 'admin'", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-1", email: "admin@example.com" } },
      });
      mockProfileSingle.mockResolvedValue({
        data: { role: "admin" },
      });

      const user = await requireAdminUser();

      expect(user).toEqual({
        id: "admin-1",
        email: "admin@example.com",
      });
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("redirecționează către '/auth/sign-in' dacă nu există utilizator autentificat", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      await expect(requireAdminUser()).rejects.toThrow("NEXT_REDIRECT:/auth/sign-in");
      expect(mockRedirect).toHaveBeenCalledWith("/auth/sign-in");
    });

    it("redirecționează către '/dashboard' dacă utilizatorul are rolul 'user' (nu e admin)", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "user@example.com" } },
      });
      mockProfileSingle.mockResolvedValue({
        data: { role: "user" },
      });

      await expect(requireAdminUser()).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("redirecționează către '/dashboard' dacă profilul nu a fost găsit în baza de date", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-2", email: "no-profile@example.com" } },
      });
      mockProfileSingle.mockResolvedValue({
        data: null,
      });

      await expect(requireAdminUser()).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("requireAdminApiUser (Route Handlers / API)", () => {
    it("returnează datele de admin dacă rolul este 'admin'", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-2", email: null } },
      });
      mockProfileSingle.mockResolvedValue({
        data: { role: "admin" },
      });

      const user = await requireAdminApiUser();

      expect(user).toEqual({
        id: "admin-2",
        email: null,
      });
    });

    it("aruncă AdminAuthError cu status 401 dacă utilizatorul nu este autentificat", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      await expect(requireAdminApiUser()).rejects.toThrow(AdminAuthError);
      await expect(requireAdminApiUser()).rejects.toMatchObject({
        message: "You must be signed in.",
        status: 401,
      });
    });

    it("aruncă AdminAuthError cu status 403 dacă utilizatorul este autentificat dar NU este admin", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-3", email: "regular@example.com" } },
      });
      mockProfileSingle.mockResolvedValue({
        data: { role: "user" },
      });

      await expect(requireAdminApiUser()).rejects.toThrow(AdminAuthError);
      await expect(requireAdminApiUser()).rejects.toMatchObject({
        message: "Admin access required.",
        status: 403,
      });
    });
  });

  describe("adminAuthErrorResponse", () => {
    it("generează un NextResponse cu statusul și mesajul de eroare pentru AdminAuthError", async () => {
      const error = new AdminAuthError("Admin access required.", 403);
      const response = adminAuthErrorResponse(error);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(403);
      
      const body = await response?.json();
      expect(body).toEqual({ error: "Admin access required." });
    });

    it("returnează null pentru erori standard care nu sunt AdminAuthError", () => {
      const genericError = new Error("Database connection failed");
      const response = adminAuthErrorResponse(genericError);

      expect(response).toBeNull();
    });
  });
});