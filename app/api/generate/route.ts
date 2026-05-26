import { NextResponse } from "next/server";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
    createSignedUrl,
    uploadFileToStorage
} from "@/lib/storage";
import { buildCaricaturePrompt } from "@/lib/ai/prompts";

import type {
    CaricatureIntensity,
    CaricatureStyle,
    UserPlan
} from "@/types/caricature";

export const runtime = "nodejs";

const supabaseAdmin = createSupabaseAdminClient();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const FREE_GENERATIONS_LIMIT = 3;

const allowedStyles: CaricatureStyle[] = [
    "realistic_human_drawn",
    "classic_line_art",
    "black_white_sketch",
    "street_caricature",
    "classic_color",
    "comic_caricature"
];

const allowedIntensities: CaricatureIntensity[] = ["low", "medium", "high"];

type ProfileRow = {
    id: string;
    plan: UserPlan;
    free_generations_used: number;
};

async function getProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, plan, free_generations_used")
        .eq("id", userId)
        .single();

    if (error || !data) {
        const { data: createdProfile, error: createError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                plan: "free",
                free_generations_used: 0
            })
            .select("id, plan, free_generations_used")
            .single();

        if (createError || !createdProfile) {
            throw new Error(createError?.message || "Could not create user profile.");
        }

        return {
            id: createdProfile.id,
            plan: createdProfile.plan as UserPlan,
            free_generations_used: createdProfile.free_generations_used || 0
        };
    }

    return {
        id: data.id,
        plan: data.plan as UserPlan,
        free_generations_used: data.free_generations_used || 0
    };
}

function validateStyle(value: FormDataEntryValue | null): CaricatureStyle {
    if (typeof value !== "string") {
        return "realistic_human_drawn";
    }

    if (allowedStyles.includes(value as CaricatureStyle)) {
        return value as CaricatureStyle;
    }

    return "realistic_human_drawn";
}

function validateIntensity(value: FormDataEntryValue | null): CaricatureIntensity {
    if (typeof value !== "string") {
        return "low";
    }

    if (allowedIntensities.includes(value as CaricatureIntensity)) {
        return value as CaricatureIntensity;
    }

    return "low";
}

function getExtensionFromContentType(contentType: string) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("webp")) return "webp";
    return "jpg";
}

async function createDemoImageUrl() {
    return "https://placehold.co/1024x1024/png?text=Demo+Caricature";
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
                {
                    error: "You must be signed in."
                },
                {
                    status: 401
                }
            );
        }

        const formData = await request.formData();

        const image = formData.get("image");
        const style = validateStyle(formData.get("style"));
        const intensity = validateIntensity(formData.get("intensity"));

        if (!(image instanceof File)) {
            return NextResponse.json(
                {
                    error: "Please upload a valid image."
                },
                {
                    status: 400
                }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    error: "Only image files are allowed."
                },
                {
                    status: 400
                }
            );
        }

        const profile = await getProfile(user.id);

        const isPro = profile.plan === "pro" || profile.plan === "admin";
        const isAdmin = profile.plan === "admin";
        const demoMode = process.env.DEMO_MODE === "true";

        if (!isPro && profile.free_generations_used >= FREE_GENERATIONS_LIMIT) {
            return NextResponse.json(
                {
                    error: "You have used all free generations. Upgrade to continue."
                },
                {
                    status: 403
                }
            );
        }

        const generationId = randomUUID();
        const variationToken = randomUUID();

        const imageArrayBuffer = await image.arrayBuffer();
        const originalBuffer = Buffer.from(imageArrayBuffer);

        const extension = getExtensionFromContentType(image.type || "image/jpeg");

        const originalPath = `${user.id}/originals/${generationId}.${extension}`;
        const previewPath = `${user.id}/previews/${generationId}.png`;
        const finalPath = `${user.id}/finals/${generationId}.png`;

        const uploadedOriginalPath = await uploadFileToStorage({
            path: originalPath,
            buffer: originalBuffer,
            contentType: image.type || "image/jpeg"
        });

        let generatedBuffer: Buffer;

        const prompt = buildCaricaturePrompt({
            style,
            intensity,
            variationToken,
            plan: profile.plan
        });

        if (demoMode) {
            generatedBuffer = originalBuffer;
        } else {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("Missing OPENAI_API_KEY.");
            }

            const inputFile = new File([originalBuffer], image.name || "portrait.jpg", {
                type: image.type || "image/jpeg"
            });

            const result = await openai.images.edit({
                model: "gpt-image-1",
                image: inputFile,
                prompt,
                size: "1024x1024"
            });

            const base64Image = result.data?.[0]?.b64_json;

            if (!base64Image) {
                throw new Error("OpenAI did not return an image.");
            }

            generatedBuffer = Buffer.from(base64Image, "base64");
        }

        await uploadFileToStorage({
            path: previewPath,
            buffer: generatedBuffer,
            contentType: "image/png"
        });

        await uploadFileToStorage({
            path: finalPath,
            buffer: generatedBuffer,
            contentType: "image/png"
        });

        const previewImage = demoMode
            ? await createDemoImageUrl()
            : await createSignedUrl(previewPath);

        const originalImage = await createSignedUrl(uploadedOriginalPath);

        const paymentStatus = isPro || isAdmin ? "paid" : "unpaid";

        const { error: insertError } = await supabaseAdmin
            .from("generations")
            .insert({
                id: generationId,
                user_id: user.id,
                original_image_path: uploadedOriginalPath,
                preview_image_path: previewPath,
                final_image_path: finalPath,
                style,
                intensity,
                status: "completed",
                payment_status: paymentStatus,
                demo: demoMode,
                quality: isPro ? "pro" : "standard",
                watermark_type: paymentStatus === "paid" ? "none" : "standard",
                is_pro: isPro,
                prompt_used: prompt,
                variation_token: variationToken,
                model_provider: isPro ? "custom_lora_ready" : "openai",
                model_name: isPro ? "future-caricature-lora" : "gpt-image-1",
                generation_mode: demoMode ? "demo" : isPro ? "pro_lora" : "standard"
            });

        if (insertError) {
            throw new Error(insertError.message);
        }

        if (!isPro && !isAdmin && !demoMode) {
            const { error: updateProfileError } = await supabaseAdmin
                .from("profiles")
                .update({
                    free_generations_used: profile.free_generations_used + 1
                })
                .eq("id", user.id);

            if (updateProfileError) {
                console.error("Could not update free generations:", updateProfileError);
            }
        }

        const remainingFreeGenerations = isPro
            ? FREE_GENERATIONS_LIMIT
            : Math.max(
                0,
                FREE_GENERATIONS_LIMIT - (profile.free_generations_used + 1)
            );

        return NextResponse.json({
            generationId,
            originalImage,
            previewImage,
            demo: demoMode,
            paymentStatus,
            remainingFreeGenerations
        });
    } catch (error) {
        console.error("GENERATE_ERROR:", error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Generation failed."
            },
            {
                status: 500
            }
        );
    }
}