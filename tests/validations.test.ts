import { describe, it, expect } from "vitest";
import { validateImageFile } from "@/lib/validations";

function createMockFile(name: string, type: string, sizeInBytes: number): File {
  const blob = new Blob(["a".repeat(Math.min(sizeInBytes, 1024))], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, "size", { value: sizeInBytes, writable: false });
  return file;
}

const MB = 1024 * 1024;
const MAX_IMAGE_SIZE_MB = 8;
const MAX_BYTES = MAX_IMAGE_SIZE_MB * MB;

describe("lib/validations.ts - validateImageFile", () => {
  describe("Date valide", () => {
    it.each([
      "image/jpeg",
      "image/png",
      "image/webp"
    ])("permite tipul MIME valid: %s", (mimeType) => {
      const validFile = createMockFile("test-image", mimeType, 2 * MB);

      expect(() => validateImageFile(validFile)).not.toThrow();
    });

    it("nu aruncă eroare pentru o imagine de dimensiune obișnuită", () => {
      const file = createMockFile("portrait.jpg", "image/jpeg", 2.5 * MB);

      expect(() => validateImageFile(file)).not.toThrow();
    });
  });

  describe("Date invalide", () => {
    it.each([
      "image/gif",
      "image/svg+xml",
      "image/bmp",
      "application/pdf",
      "text/plain",
      ""
    ])("aruncă eroare pentru tip MIME neacceptat: %s", (invalidMime) => {
      const file = createMockFile("file", invalidMime, 1 * MB);

      expect(() => validateImageFile(file)).toThrow(
        "Invalid file format. Please upload a JPG, PNG, or WEBP image."
      );
    });

    it("aruncă eroare pentru un fișier care depășește limita de dimensiune", () => {
      const file = createMockFile("huge.jpg", "image/jpeg", 12 * MB);

      expect(() => validateImageFile(file)).toThrow(
        "Image is too large. Maximum size is 8MB."
      );
    });

    it("aruncă mai întâi eroarea de format dacă ambele sunt invalide", () => {
      const file = createMockFile("huge.gif", "image/gif", 20 * MB);

      expect(() => validateImageFile(file)).toThrow(
        "Invalid file format. Please upload a JPG, PNG, or WEBP image."
      );
    });
  });

  describe("Cazuri de la limită (boundary values)", () => {
    it("permite un fișier cu dimensiunea 0 bytes", () => {
      const file = createMockFile("empty.png", "image/png", 0);

      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("permite un fișier cu dimensiunea exact la limită (exact 8MB)", () => {
      const file = createMockFile("boundary.webp", "image/webp", MAX_BYTES);

      expect(() => validateImageFile(file)).not.toThrow();
    });

    it("aruncă eroare pentru un fișier cu exact 1 byte peste limită", () => {
      const file = createMockFile("over-boundary.jpg", "image/jpeg", MAX_BYTES + 1);

      expect(() => validateImageFile(file)).toThrow(
        "Image is too large. Maximum size is 8MB."
      );
    });

    it("permite un fișier cu exact 1 byte sub limită", () => {
      const file = createMockFile("under-boundary.png", "image/png", MAX_BYTES - 1);

      expect(() => validateImageFile(file)).not.toThrow();
    });
  });
});