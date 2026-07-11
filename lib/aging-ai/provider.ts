import { buildAgingPrompt } from "@/lib/aging-ai/prompts";
import { generateWithReplicate } from "@/lib/aging-ai/replicate-provider";
import type { AgingPreset, AgingProvider } from "@/lib/aging-ai/types";

type GenerateAgingImageInput = {
    imageFile: File;
    agePreset: AgingPreset;
    variationToken?: string;
};

export async function generateAgingImage({
                                             imageFile,
                                             agePreset,
                                             variationToken = crypto.randomUUID()
                                         }: GenerateAgingImageInput): Promise<{
    imageUrl: string;
    prompt: string;
    provider: AgingProvider;
}> {
    const provider = (process.env.AGING_PROVIDER || "replicate") as AgingProvider;
    const prompt = buildAgingPrompt({
        agePreset,
        variationToken
    });

    if (provider !== "replicate") {
        throw new Error(`Unsupported aging provider: ${provider}`);
    }

    const { imageUrl } = await generateWithReplicate({
        imageFile,
        agePreset,
        prompt
    });

    return {
        imageUrl,
        prompt,
        provider
    };
}
