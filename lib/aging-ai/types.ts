export type AgingPreset = "age_10" | "age_20" | "age_35" | "senior";

export type AgingProvider = "replicate";

export type AgingAIResponse = {
    ok: boolean;
    imageUrl?: string;
    prompt?: string;
    provider?: AgingProvider;
    error?: string;
};

export const agingPresets = [
    {
        id: "age_10",
        label: "+10 years",
        description: "Subtle age progression."
    },
    {
        id: "age_20",
        label: "+20 years",
        description: "Natural mature look."
    },
    {
        id: "age_35",
        label: "+35 years",
        description: "Strong realistic age progression."
    },
    {
        id: "senior",
        label: "Senior",
        description: "Clearly older senior appearance."
    }
] as const satisfies ReadonlyArray<{
    id: AgingPreset;
    label: string;
    description: string;
}>;
