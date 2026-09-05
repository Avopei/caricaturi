import { describe, expect, it } from "vitest";
import {
    allowedIntensities,
    allowedStyles,
    validateImageFile,
    validateIntensity,
    validateStyle
} from "@/lib/validations";

function makeFile(type: string, sizeInMb: number) {
    const bytes = new Uint8Array(Math.floor(sizeInMb * 1024 * 1024));
    return new File([bytes], "photo", { type });
}

describe("validateImageFile", () => {
    it("accepts allowed image types under the size limit", () => {
        expect(() => validateImageFile(makeFile("image/jpeg", 1))).not.toThrow();
        expect(() => validateImageFile(makeFile("image/png", 1))).not.toThrow();
        expect(() => validateImageFile(makeFile("image/webp", 1))).not.toThrow();
    });

    it("rejects disallowed file types", () => {
        expect(() => validateImageFile(makeFile("application/pdf", 1))).toThrow(
            "Invalid file format. Please upload a JPG, PNG, or WEBP image."
        );
    });

    it("rejects files over the size limit", () => {
        expect(() => validateImageFile(makeFile("image/png", 9))).toThrow(
            "Image is too large. Maximum size is 8MB."
        );
    });
});

describe("validateStyle", () => {
    it.each(allowedStyles)("accepts the whitelisted style %s", (style) => {
        expect(validateStyle(style)).toBe(style);
    });

    it("falls back to realistic_human_drawn for an unknown style", () => {
        expect(validateStyle("not_a_real_style")).toBe("realistic_human_drawn");
    });

    it("falls back to realistic_human_drawn when the value is not a string", () => {
        expect(validateStyle(null)).toBe("realistic_human_drawn");
    });
});

describe("validateIntensity", () => {
    it.each(allowedIntensities)("accepts the whitelisted intensity %s", (intensity) => {
        expect(validateIntensity(intensity)).toBe(intensity);
    });

    it("falls back to low for an unknown intensity", () => {
        expect(validateIntensity("extreme")).toBe("low");
    });

    it("falls back to low when the value is not a string", () => {
        expect(validateIntensity(null)).toBe("low");
    });
});
