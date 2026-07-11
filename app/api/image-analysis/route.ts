import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_PYTHON_IMAGE_ANALYSIS_URL = "http://localhost:8001";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const image = formData.get("image");

        if (!(image instanceof File)) {
            return NextResponse.json(
                { ok: false, error: "Upload an image file." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                { ok: false, error: "The uploaded file must be an image." },
                { status: 400 }
            );
        }

        const pythonServiceUrl =
            process.env.PYTHON_IMAGE_ANALYSIS_URL || DEFAULT_PYTHON_IMAGE_ANALYSIS_URL;
        const analyzeUrl = new URL("/analyze-image", pythonServiceUrl);
        const pythonFormData = new FormData();

        pythonFormData.append("image", image, image.name || "portrait-image");
        pythonFormData.append("file", image, image.name || "portrait-image");

        const response = await fetch(analyzeUrl, {
            method: "POST",
            body: pythonFormData
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await response.json()
            : { ok: false, error: await response.text() };

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("PYTHON_IMAGE_ANALYSIS_ERROR", error);

        return NextResponse.json(
            {
                ok: false,
                error: "Python image analysis service is not available."
            },
            { status: 503 }
        );
    }
}
