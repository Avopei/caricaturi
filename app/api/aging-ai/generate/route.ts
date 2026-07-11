import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { generateAgingImage } from "@/lib/aging-ai/provider";
import { agingPresets, type AgingPreset } from "@/lib/aging-ai/types";

export const runtime = "nodejs";

const allowedPresets = agingPresets.map((preset) => preset.id);

function parseAgePreset(value: FormDataEntryValue | null): AgingPreset | null {
    if (typeof value !== "string") {
        return null;
    }

    if (allowedPresets.includes(value as AgingPreset)) {
        return value as AgingPreset;
    }

    return null;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const image = formData.get("image");
        const agePreset = parseAgePreset(formData.get("agePreset"));

        if (!(image instanceof File)) {
            return NextResponse.json(
                { ok: false, error: "Upload a portrait image first." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                { ok: false, error: "The uploaded file must be an image." },
                { status: 400 }
            );
        }

        if (!agePreset) {
            return NextResponse.json(
                { ok: false, error: "Choose a valid age preset." },
                { status: 400 }
            );
        }

        const { imageUrl, prompt, provider } = await generateAgingImage({
            imageFile: image,
            agePreset,
            variationToken: randomUUID()
        });

        return NextResponse.json({
            ok: true,
            imageUrl,
            prompt,
            provider
        });
    } catch (error) {
        console.error("AGING_AI_GENERATE_ERROR", error);

        const message =
            error instanceof Error && error.message.includes("REPLICATE_API_TOKEN")
                ? "AI aging is not configured yet. Add REPLICATE_API_TOKEN to generate results."
                : "AI aging provider could not generate a result. Please try again.";

        return NextResponse.json(
            {
                ok: false,
                error: message
            },
            { status: 500 }
        );
    }
}
