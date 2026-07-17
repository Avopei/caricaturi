import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { generateAgingImage } from "@/lib/aging-ai/provider";
import { agingPresets, type AgingPreset } from "@/lib/aging-ai/types";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
    GenerationNotAllowedError,
    assertCanGenerate,
    getOrCreateProfile,
    incrementUsageIfMetered
} from "@/lib/plan";

export const runtime = "nodejs";

const supabaseAdmin = createSupabaseAdminClient();

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
        const supabase = await createClient();

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { ok: false, error: "You must be signed in." },
                { status: 401 }
            );
        }

        const profile = await getOrCreateProfile(user.id, user.email);

        try {
            await assertCanGenerate(profile);
        } catch (error) {
            if (error instanceof GenerationNotAllowedError) {
                return NextResponse.json(
                    { ok: false, error: error.message },
                    { status: error.status }
                );
            }

            throw error;
        }

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

        const { error: insertError } = await supabaseAdmin.from("generations").insert({
            id: randomUUID(),
            user_id: user.id,
            tool: "aging",
            preset: agePreset,
            storage_path: imageUrl,
            prompt_used: prompt,
            status: "completed",
            model_provider: provider
        });

        if (insertError) {
            console.error("AGING_GENERATIONS_INSERT_ERROR", insertError.message);
        }

        await incrementUsageIfMetered(profile);

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
