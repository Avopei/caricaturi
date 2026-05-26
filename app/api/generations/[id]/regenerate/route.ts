import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { buildCaricaturePrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
    createSignedUrl,
    downloadFileFromStorage,
    uploadFileToStorage
} from "@/lib/storage";
import { createWatermarkedPreview } from "@/lib/watermark";
import type {
    CaricatureIntensity,
    CaricatureStyle,
    UserPlan
} from "@/types/caricature";

export const runtime = "nodejs";

const FREE_GENERATION_LIMIT = 1;

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isValidStyle(value: string): value is CaricatureStyle {
    return [
        "realistic_human_drawn",
        "classic_line_art",
        "black_white_sketch",
        "street_caricature",
        "classic_color",
        "comic_caricature"
    ].includes(value);
}

function isValidIntensity(value: string): value is CaricatureIntensity {
    return ["low", "medium", "high"].includes(value);
}

function isValidPlan(value: unknown): value is UserPlan {
    return value === "free" || value === "pro" || value === "admin";
}

function bufferToDataUrl(buffer: Buffer, mimeType: string) {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function dataUrlToBuffer(dataUrl: string) {
    const [metadata, base64] = dataUrl.split(",");

    if (!metadata || !base64) {
        throw new Error("Preview image data URL invalid.");
    }

    const mimeMatch = metadata.match(/data:(.*);base64/);
    const mimeType = mimeMatch?.[1] || "image/svg+xml";

    return {
        buffer: Buffer.from(base64, "base64"),
        mimeType
    };
}

async function getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, plan, free_generations_used")
        .eq("id", userId)
        .single();

    if (error || !data) {
        throw new Error("User profile was not found.");
    }

    const plan: UserPlan = isValidPlan(data.plan) ? data.plan : "free";

    return {
        id: data.id as string,
        plan,
        freeGenerationsUsed: Number(data.free_generations_used || 0)
    };
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const supabase = await createClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        const profile = await getProfile(user.id);
        const isPro = profile.plan === "pro" || profile.plan === "admin";

        if (!isPro && profile.freeGenerationsUsed >= FREE_GENERATION_LIMIT) {
            return NextResponse.json(
                {
                    error:
                        "You have used your free generation. Upgrade to Pro for more variations."
                },
                { status: 403 }
            );
        }

        const body = await request.json().catch(() => ({}));

        const rawStyle = String(body.style || "realistic_human_drawn");
        const rawIntensity = String(body.intensity || "low");

        const style: CaricatureStyle = isValidStyle(rawStyle)
            ? rawStyle
            : "realistic_human_drawn";

        const intensity: CaricatureIntensity = isValidIntensity(rawIntensity)
            ? rawIntensity
            : "low";

        const { data: parentGeneration, error: parentError } = await supabaseAdmin
            .from("generations")
            .select("id,user_id,original_image_path,version_number")
            .eq("id", id)
            .single();

        if (parentError || !parentGeneration) {
            return NextResponse.json(
                { error: "Original generation was not found." },
                { status: 404 }
            );
        }

        if (parentGeneration.user_id !== user.id) {
            return NextResponse.json(
                { error: "You do not have access to this generation." },
                { status: 403 }
            );
        }

        if (!parentGeneration.original_image_path) {
            return NextResponse.json(
                { error: "Original image is missing for this generation." },
                { status: 404 }
            );
        }

        const originalFile = await downloadFileFromStorage(
            parentGeneration.original_image_path
        );

        const generationId = randomUUID();
        const variationToken = randomUUID();

        const promptUsed = buildCaricaturePrompt({
            style,
            intensity,
            variationToken,
            plan: profile.plan
        });

        const quality = isPro ? "hd" : "standard";
        const watermarkType = isPro ? "none" : "small";

        const originalPath = `${user.id}/originals/${generationId}.png`;
        const previewPath = `${user.id}/previews/${generationId}.svg`;
        const finalPath = `${user.id}/finals/${generationId}.png`;

        const uploadedOriginalPath = await uploadFileToStorage({
            path: originalPath,
            buffer: originalFile.buffer,
            contentType: originalFile.contentType
        });

        let finalImageDataUrl: string;
        let isDemo = false;

        if (process.env.DEMO_MODE === "true") {
            finalImageDataUrl = bufferToDataUrl(
                originalFile.buffer,
                originalFile.contentType
            );
            isDemo = true;

            await uploadFileToStorage({
                path: finalPath,
                buffer: originalFile.buffer,
                contentType: originalFile.contentType
            });
        } else {
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                return NextResponse.json(
                    {
                        error:
                            "OPENAI_API_KEY is missing or could not be read from .env.local."
                    },
                    { status: 500 }
                );
            }

            const openai = new OpenAI({ apiKey });

            const imageFile = await toFile(
                originalFile.buffer,
                "original-portrait.png",
                {
                    type: originalFile.contentType
                }
            );

            const result = await openai.images.edit({
                model: "gpt-image-1",
                image: imageFile,
                prompt: promptUsed,
                size: "1024x1024"
            });

            const base64 = result.data?.[0]?.b64_json;

            if (!base64) {
                return NextResponse.json(
                    { error: "The AI model did not return an image." },
                    { status: 500 }
                );
            }

            const finalBuffer = Buffer.from(base64, "base64");

            await uploadFileToStorage({
                path: finalPath,
                buffer: finalBuffer,
                contentType: "image/png"
            });

            finalImageDataUrl = `data:image/png;base64,${base64}`;
        }

        const previewDataUrl =
            watermarkType === "none"
                ? finalImageDataUrl
                : createWatermarkedPreview(finalImageDataUrl);

        const previewFile = dataUrlToBuffer(previewDataUrl);

        const uploadedPreviewPath = await uploadFileToStorage({
            path: previewPath,
            buffer: previewFile.buffer,
            contentType: previewFile.mimeType
        });

        const nextVersion = Number(parentGeneration.version_number || 1) + 1;

        const { data: generation, error: insertError } = await supabaseAdmin
            .from("generations")
            .insert({
                id: generationId,
                user_id: user.id,
                original_image_path: uploadedOriginalPath,
                preview_image_path: uploadedPreviewPath,
                final_image_path: finalPath,
                style,
                intensity,
                status: "completed",
                payment_status: isPro ? "paid" : "unpaid",
                demo: isDemo,
                quality,
                watermark_type: watermarkType,
                is_pro: isPro,
                prompt_used: promptUsed,
                variation_token: variationToken,
                model_provider: isPro ? "custom_lora_ready" : "openai",
                model_name: isPro ? "future-caricature-lora" : "gpt-image-1",
                generation_mode:
                    process.env.DEMO_MODE === "true"
                        ? "demo"
                        : isPro
                            ? "pro_lora"
                            : "standard",
                parent_generation_id: parentGeneration.id,
                version_number: nextVersion
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(insertError.message);
        }

        if (!isPro) {
            const { error: profileUpdateError } = await supabaseAdmin
                .from("profiles")
                .update({
                    free_generations_used: profile.freeGenerationsUsed + 1
                })
                .eq("id", user.id);

            if (profileUpdateError) {
                throw new Error(profileUpdateError.message);
            }
        }

        const previewImage = await createSignedUrl(uploadedPreviewPath);
        const originalImage = await createSignedUrl(uploadedOriginalPath);

        return NextResponse.json({
            generationId: generation.id,
            originalImage,
            previewImage,
            demo: generation.demo,
            paymentStatus: generation.payment_status,
            remainingFreeGenerations: isPro
                ? 999
                : Math.max(
                    0,
                    FREE_GENERATION_LIMIT - (profile.freeGenerationsUsed + 1)
                )
        });
    } catch (error) {
        console.error("REGENERATE_ERROR:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "An error occurred while regenerating the image."
            },
            { status: 500 }
        );
    }
}