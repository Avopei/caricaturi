import type { AgingPreset } from "@/lib/aging-ai/types";

type BuildAgingPromptInput = {
    agePreset: AgingPreset;
    variationToken: string;
};

const presetInstructions: Record<AgingPreset, string[]> = {
    age_10: [
        "Apply subtle aging."
    ],
    age_20: [
        "Apply moderate natural aging."
    ],
    age_35: [
        "Apply strong realistic aging."
    ],
    senior: [
        "Create a clearly older senior appearance."
    ]
};

export function buildAgingPrompt({
                                     agePreset,
                                     variationToken
                                 }: BuildAgingPromptInput): string {
    return [
        "Transform the uploaded portrait into a realistic older version of the same person.",
        "Preserve the exact same identity.",
        "Preserve pose, face orientation, gaze direction, clothing, hairstyle structure, background and framing.",
        "The result should look like the same photograph taken many years later.",
        ...presetInstructions[agePreset],
        "Do not draw wrinkles on top of the image.",
        "Do not create overlay lines.",
        "Do not create sketch marks.",
        "Do not create ghosting.",
        "Do not create double exposure.",
        "Do not create duplicate faces.",
        "Do not create cartoon or drawing style.",
        "Output should be a single clean photorealistic image.",
        `Variation token ${variationToken}: create a fresh age progression while preserving the same person and original composition.`
    ].join(" ");
}
