import { describe, expect, it } from "vitest";
import {
    allowedIntensities,
    allowedStyles,
    validateIntensity,
    validateStyle
} from "@/lib/generate-validations";

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
