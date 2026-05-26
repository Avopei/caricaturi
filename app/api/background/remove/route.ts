import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSignedUrl, uploadFileToStorage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!(image instanceof File)) {
            return NextResponse.json(
                { error: "Upload an image file." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "The uploaded file must be an image." },
                { status: 400 }
            );
        }

        const apiKey = process.env.REMOVE_BG_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "REMOVE_BG_API_KEY is missing." },
                { status: 500 }
            );
        }

        const originalBuffer = Buffer.from(await image.arrayBuffer());
        const generationId = randomUUID();
        const originalPath = `${user.id}/background/originals/${generationId}.jpg`;
        const resultPath = `${user.id}/background/results/${generationId}.png`;

        await uploadFileToStorage({
            path: originalPath,
            buffer: originalBuffer,
            contentType: image.type
        });

        const removeBgFormData = new FormData();
        removeBgFormData.append(
            "image_file",
            new Blob([originalBuffer], { type: image.type }),
            image.name || "background-input.jpg"
        );
        removeBgFormData.append("size", "auto");

        const removeBgResponse = await fetch(
            "https://api.remove.bg/v1.0/removebg",
            {
                method: "POST",
                headers: {
                    "X-Api-Key": apiKey
                },
                body: removeBgFormData
            }
        );

        if (!removeBgResponse.ok) {
            const errorText = await removeBgResponse.text();

            console.error("REMOVE_BG_API_ERROR", {
                status: removeBgResponse.status,
                body: errorText
            });

            return NextResponse.json(
                {
                    error:
                        errorText ||
                        "remove.bg could not remove the background from this image."
                },
                { status: removeBgResponse.status }
            );
        }

        const resultBuffer = Buffer.from(await removeBgResponse.arrayBuffer());

        await uploadFileToStorage({
            path: resultPath,
            buffer: resultBuffer,
            contentType: "image/png"
        });

        const resultImage = await createSignedUrl(resultPath);

        return NextResponse.json({
            resultImage,
            filePath: resultPath
        });
    } catch (error) {
        console.error("REMOVE_BG_API_ERROR", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not remove background."
            },
            { status: 500 }
        );
    }
}
