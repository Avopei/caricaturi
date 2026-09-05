import { describe, expect, it } from "vitest";
import { buildCaricaturePrompt } from "@/lib/ai/prompts";
import type {
    CaricatureIntensity,
    CaricatureStyle
} from "@/types/caricature";

const styles: CaricatureStyle[] = [
    "realistic_human_drawn",
    "classic_line_art",
    "black_white_sketch",
    "street_caricature",
    "classic_color",
    "comic_caricature"
];

const intensities: CaricatureIntensity[] = ["low", "medium", "high"];

const styleMarkers: Record<CaricatureStyle, string> = {
    realistic_human_drawn: "REALISTIC HUMAN-DRAWN CARICATURE",
    classic_line_art: "CLASSIC LINE ART",
    black_white_sketch: "BLACK AND WHITE SKETCH",
    street_caricature: "STREET CARICATURE",
    classic_color: "CLASSIC COLOR CARICATURE",
    comic_caricature: "COMIC CARICATURE"
};

const intensityMarkers: Record<CaricatureIntensity, string> = {
    low: "Subtle and realistic.",
    medium: "Moderate professional caricature.",
    high: "Strong but controlled caricature."
};

describe("buildCaricaturePrompt", () => {
    it.each(styles)("includes the style-specific instructions for %s", (style) => {
        const prompt = buildCaricaturePrompt({
            style,
            intensity: "medium",
            variationToken: "token-style",
            isPro: false
        });

        expect(prompt).toContain(styleMarkers[style]);
    });

    it.each(intensities)("includes the intensity-specific instructions for %s", (intensity) => {
        const prompt = buildCaricaturePrompt({
            style: "realistic_human_drawn",
            intensity,
            variationToken: "token-intensity",
            isPro: false
        });

        expect(prompt).toContain(intensityMarkers[intensity]);
    });

    it("includes the pro quality instruction when isPro is true", () => {
        const prompt = buildCaricaturePrompt({
            style: "realistic_human_drawn",
            intensity: "low",
            variationToken: "token-pro",
            isPro: true
        });

        expect(prompt).toContain("PRO QUALITY INSTRUCTION:");
        expect(prompt).not.toContain("STANDARD QUALITY INSTRUCTION:");
    });

    it("includes the standard quality instruction when isPro is false", () => {
        const prompt = buildCaricaturePrompt({
            style: "realistic_human_drawn",
            intensity: "low",
            variationToken: "token-standard",
            isPro: false
        });

        expect(prompt).toContain("STANDARD QUALITY INSTRUCTION:");
        expect(prompt).not.toContain("PRO QUALITY INSTRUCTION:");
    });

    it("embeds the given variationToken as the uniqueness token prefix", () => {
        const variationToken = "some-unique-token-abc123";

        const prompt = buildCaricaturePrompt({
            style: "realistic_human_drawn",
            intensity: "low",
            variationToken,
            isPro: false
        });

        expect(prompt).toContain(`Uniqueness token:\n${variationToken}-`);
    });

    it("produces a different uniqueness token suffix across calls with the same input", () => {
        const input = {
            style: "realistic_human_drawn" as const,
            intensity: "low" as const,
            variationToken: "same-token",
            isPro: false
        };

        const prompts = new Set(
            Array.from({ length: 20 }, () => buildCaricaturePrompt(input))
        );

        expect(prompts.size).toBeGreaterThan(1);
    });
});
