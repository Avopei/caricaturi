"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";

type AgeEffect = "10" | "20" | "30";

type ImageAnalysisResult = {
    ok: boolean;
    orientation?: string;
    brightness?: string;
    contrast?: string;
    estimatedFaceArea?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    estimatedHeadPose?: string;
    expressionHint?: string;
    promptHints?: string[];
};

const ageOptions: Array<{ value: AgeEffect; label: string }> = [
    { value: "10", label: "+10 years" },
    { value: "20", label: "+20 years" },
    { value: "30", label: "+30 years" }
];

const promptGuidance =
    "Create an older version of this person while preserving identity, head angle, expression, clothing and background. Add natural aging signs such as forehead lines, under-eye wrinkles, natural skin texture and subtle gray hair.";

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load the image."));
        image.src = src;
    });
}

function clampChannel(value: number) {
    return Math.max(0, Math.min(255, value));
}

function drawAgingLines(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    strength: number
) {
    const lineAlpha = 0.16 + strength * 0.16;
    const highlightAlpha = 0.04 + strength * 0.05;

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    function strokeCurve(
        color: string,
        alpha: number,
        lineWidth: number,
        points: [number, number, number, number, number, number]
    ) {
        context.strokeStyle = color;
        context.globalAlpha = alpha;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(points[0] * width, points[1] * height);
        context.quadraticCurveTo(
            points[2] * width,
            points[3] * height,
            points[4] * width,
            points[5] * height
        );
        context.stroke();
    }

    const foreheadLines: Array<[number, number, number, number, number, number]> = [
        [0.32, 0.24, 0.5, 0.215, 0.68, 0.24],
        [0.34, 0.285, 0.5, 0.265, 0.66, 0.285],
        [0.37, 0.33, 0.5, 0.315, 0.63, 0.33],
        [0.35, 0.37, 0.5, 0.355, 0.65, 0.37]
    ];

    foreheadLines.forEach((line, index) => {
        strokeCurve("rgba(35, 24, 19, 1)", lineAlpha, 1.2 + strength * 1.6, line);
        strokeCurve(
            "rgba(255, 255, 255, 1)",
            highlightAlpha,
            1,
            [line[0], line[1] - 0.007, line[2], line[3] - 0.007, line[4], line[5] - 0.007]
        );

        if (index < 1 + strength * 3) {
            strokeCurve("rgba(35, 24, 19, 1)", lineAlpha * 0.75, 1 + strength, [
                line[0] + 0.02,
                line[1] + 0.025,
                line[2],
                line[3] + 0.015,
                line[4] - 0.02,
                line[5] + 0.025
            ]);
        }
    });

    const eyeLines: Array<[number, number, number, number, number, number]> = [
        [0.28, 0.44, 0.36, 0.475, 0.44, 0.455],
        [0.56, 0.455, 0.64, 0.475, 0.72, 0.44],
        [0.29, 0.49, 0.36, 0.515, 0.43, 0.505],
        [0.57, 0.505, 0.64, 0.515, 0.71, 0.49],
        [0.25, 0.405, 0.31, 0.385, 0.39, 0.405],
        [0.61, 0.405, 0.69, 0.385, 0.75, 0.405]
    ];

    eyeLines.forEach((line) => {
        strokeCurve("rgba(34, 24, 21, 1)", lineAlpha * 0.95, 1.1 + strength, line);
    });

    const smileLines: Array<[number, number, number, number, number, number]> = [
        [0.36, 0.55, 0.33, 0.64, 0.37, 0.73],
        [0.64, 0.55, 0.67, 0.64, 0.63, 0.73],
        [0.41, 0.7, 0.5, 0.725, 0.59, 0.7]
    ];

    smileLines.forEach((line) => {
        strokeCurve("rgba(38, 26, 21, 1)", lineAlpha, 1.4 + strength * 1.3, line);
        strokeCurve("rgba(255, 255, 255, 1)", highlightAlpha, 1, [
            line[0] + (line[0] < 0.5 ? 0.012 : -0.012),
            line[1],
            line[2] + (line[2] < 0.5 ? 0.012 : -0.012),
            line[3],
            line[4] + (line[4] < 0.5 ? 0.012 : -0.012),
            line[5]
        ]);
    });

    const neckLines: Array<[number, number, number, number, number, number]> = [
        [0.36, 0.78, 0.5, 0.81, 0.64, 0.78],
        [0.34, 0.835, 0.5, 0.865, 0.66, 0.835],
        [0.36, 0.89, 0.5, 0.915, 0.64, 0.89]
    ];

    neckLines.forEach((line) => {
        strokeCurve("rgba(38, 26, 21, 1)", lineAlpha * 0.8, 1.2 + strength, line);
    });

    context.globalAlpha = 0.06 + strength * 0.1;
    context.fillStyle = "rgba(58, 38, 28, 1)";
    context.beginPath();
    context.ellipse(0.5 * width, 0.52 * height, 0.29 * width, 0.34 * height, 0, 0, Math.PI * 2);
    context.fill();

    context.restore();
}

function drawGrayHair(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    strength: number
) {
    const strokeCount = Math.round(24 + strength * 42);
    const top = height * 0.095;
    const hairHeight = height * (0.16 + strength * 0.04);

    context.save();
    context.lineCap = "round";
    context.globalAlpha = 0.18 + strength * 0.22;
    context.lineWidth = Math.max(1, width * 0.0025);

    for (let index = 0; index < strokeCount; index += 1) {
        const centerBias = Math.sin((index / strokeCount) * Math.PI);
        const x = width * (0.27 + Math.random() * 0.46);
        const y = top + Math.random() * hairHeight * centerBias;
        const length = height * (0.035 + Math.random() * 0.06) * (0.7 + strength);
        const curve = (Math.random() - 0.5) * width * 0.04;

        context.strokeStyle =
            Math.random() > 0.35
                ? "rgba(210, 210, 205, 1)"
                : "rgba(145, 145, 140, 1)";
        context.beginPath();
        context.moveTo(x, y);
        context.quadraticCurveTo(
            x + curve,
            y + length * 0.45,
            x + curve * 0.4,
            y + length
        );
        context.stroke();
    }

    context.restore();
}

function applyPixelAging(
    imageData: ImageData,
    ageEffect: AgeEffect,
    width: number,
    height: number
): ImageData {
    const strength = Number(ageEffect) / 30;
    const data = imageData.data;
    const grayscaleAmount = 0.16 + strength * 0.34;
    const contrast = 1.1 + strength * 0.2;
    const brightness = 0.96 - strength * 0.1;
    const noiseAmount = 7 + strength * 15;
    const warmGray = {
        red: 4 + strength * 8,
        green: -2 - strength * 4,
        blue: -8 - strength * 12
    };

    for (let index = 0; index < data.length; index += 4) {
        const pixel = index / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const normalizedX = x / width;
        const normalizedY = y / height;
        const faceDistance =
            Math.pow((normalizedX - 0.5) / 0.33, 2) +
            Math.pow((normalizedY - 0.53) / 0.42, 2);
        const faceMask = Math.max(0, 1 - faceDistance);
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const gray = red * 0.299 + green * 0.587 + blue * 0.114;
        const noise = (Math.random() - 0.5) * noiseAmount;
        const ageSpot =
            Math.random() < 0.0015 + strength * 0.004 && faceMask > 0.15
                ? 12 + strength * 22
                : 0;

        let nextRed = red + (gray - red) * grayscaleAmount;
        let nextGreen = green + (gray - green) * grayscaleAmount;
        let nextBlue = blue + (gray - blue) * grayscaleAmount;

        nextRed = (nextRed - 128) * contrast + 128;
        nextGreen = (nextGreen - 128) * contrast + 128;
        nextBlue = (nextBlue - 128) * contrast + 128;

        const faceDarkening = faceMask * (10 + strength * 26);

        data[index] = clampChannel(
            nextRed * brightness + warmGray.red + noise - faceDarkening - ageSpot
        );
        data[index + 1] = clampChannel(
            nextGreen * brightness + warmGray.green + noise - faceDarkening * 0.82 - ageSpot
        );
        data[index + 2] = clampChannel(
            nextBlue * brightness + warmGray.blue + noise - faceDarkening * 0.65 - ageSpot
        );
    }

    return imageData;
}

function formatFaceArea(faceArea?: ImageAnalysisResult["estimatedFaceArea"]) {
    if (!faceArea) return "Not available";

    return `x ${Math.round(faceArea.x)}, y ${Math.round(faceArea.y)}, w ${Math.round(faceArea.width)}, h ${Math.round(faceArea.height)}`;
}

function AnalysisDetail({
                            label,
                            value
                        }: {
    label: string;
    value?: string;
}) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-black capitalize text-neutral-950">
                {value || "Not available"}
            </dd>
        </div>
    );
}

export default function AgingPreview() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [ageEffect, setAgeEffect] = useState<AgeEffect>("10");
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");

    function handleFileChange(nextFile: File) {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(nextFile);
        setPreview(URL.createObjectURL(nextFile));
        setResultImage(null);
        setErrorMessage("");
        setViewerImage(null);
        setAnalysisResult(null);
        setAnalysisError("");
    }

    async function analyzePortrait() {
        if (!file) {
            setAnalysisError("Upload an image before running Python analysis.");
            return;
        }

        setAnalyzing(true);
        setAnalysisError("");
        setAnalysisResult(null);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/image-analysis", {
                method: "POST",
                body: formData
            });
            const data = (await response.json()) as ImageAnalysisResult & {
                error?: string;
            };

            if (!response.ok || data.ok === false) {
                throw new Error(data.error || "Python analysis is unavailable.");
            }

            setAnalysisResult(data);
        } catch {
            setAnalysisError(
                "Python analysis is unavailable. You can still use the aging preview."
            );
        } finally {
            setAnalyzing(false);
        }
    }

    async function applyAging() {
        if (!file) {
            setErrorMessage("Upload an image before applying the aging preview.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const objectUrl = URL.createObjectURL(file);

        try {
            const image = await loadImage(objectUrl);
            const canvas = document.createElement("canvas");
            const maxSize = 1400;
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const width = Math.max(1, Math.round(image.width * scale));
            const height = Math.max(1, Math.round(image.height * scale));

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Could not create an image canvas.");
            }

            context.drawImage(image, 0, 0, width, height);

            const imageData = context.getImageData(0, 0, width, height);
            context.putImageData(applyPixelAging(imageData, ageEffect, width, height), 0, 0);

            const strength = Number(ageEffect) / 30;
            context.save();
            context.globalAlpha = 0.08 + strength * 0.12;
            context.fillStyle = "rgb(116, 107, 96)";
            context.fillRect(0, 0, width, height);
            context.restore();

            drawAgingLines(context, width, height, strength);
            drawGrayHair(context, width, height, strength);

            setResultImage(canvas.toDataURL("image/jpeg", 0.92));
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Could not apply the aging preview."
            );
        } finally {
            URL.revokeObjectURL(objectUrl);
            setLoading(false);
        }
    }

    function openViewer() {
        if (resultImage) {
            setViewerImage(resultImage);
        }
    }

    function closeViewer() {
        setViewerImage(null);
    }

    return (
        <div className="min-h-[calc(100vh-7rem)] rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-950 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                    Studio workspace
                </p>
                <h1 className="mt-2 text-4xl font-black text-neutral-950 md:text-5xl">Aging Preview</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                    Apply a fast artistic future-look simulation in the browser.
                </p>
                <p className="mt-3 inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700">
                    This is an artistic age simulation, not a biological prediction.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <div className="space-y-4">
                    <ImageUploader preview={preview} onFileChange={handleFileChange} />

                    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-neutral-950">2. Choose age</h2>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {ageOptions.map((option) => {
                                const selected = ageEffect === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setAgeEffect(option.value)}
                                        className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                                            selected
                                                ? "border-black bg-black text-white"
                                                : "border-neutral-300 bg-white text-neutral-950 hover:border-black"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {file && (
                        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-black text-neutral-950">
                                3. Analyze portrait
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-neutral-600">
                                Optional local Python analysis for prompt guidance.
                            </p>

                            <button
                                type="button"
                                onClick={analyzePortrait}
                                disabled={analyzing}
                                className="mt-4 w-full rounded-lg border border-black bg-white px-5 py-3 text-center font-bold text-neutral-950 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {analyzing
                                    ? "Analyzing portrait..."
                                    : "Analyze portrait with Python"}
                            </button>

                            {analysisError && (
                                <div className="mt-4 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700">
                                    {analysisError}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={applyAging}
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-3 text-center font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Applying aging preview..." : "Apply aging preview"}
                    </button>

                    {errorMessage && (
                        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {analysisResult && (
                        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-black text-neutral-950">
                                Python analysis
                            </h2>

                            <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <AnalysisDetail
                                    label="Orientation"
                                    value={analysisResult.orientation}
                                />
                                <AnalysisDetail
                                    label="Brightness"
                                    value={analysisResult.brightness}
                                />
                                <AnalysisDetail
                                    label="Contrast"
                                    value={analysisResult.contrast}
                                />
                                <AnalysisDetail
                                    label="Head pose"
                                    value={analysisResult.estimatedHeadPose}
                                />
                                <AnalysisDetail
                                    label="Expression"
                                    value={analysisResult.expressionHint}
                                />
                                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                                    <dt className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                                        Face area
                                    </dt>
                                    <dd className="mt-1 text-sm font-black text-neutral-950">
                                        {formatFaceArea(analysisResult.estimatedFaceArea)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <h3 className="text-sm font-black text-neutral-950">
                                    Prompt hints
                                </h3>
                                {analysisResult.promptHints?.length ? (
                                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-700">
                                        {analysisResult.promptHints.map((hint) => (
                                            <li key={hint}>{hint}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-sm text-neutral-500">
                                        No prompt hints returned.
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4">
                                <h3 className="text-sm font-black text-neutral-950">
                                    AI prompt guidance
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-neutral-700">
                                    {promptGuidance}
                                </p>
                                {analysisResult.promptHints?.length ? (
                                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-700">
                                        {analysisResult.promptHints.map((hint) => (
                                            <li key={`guidance-${hint}`}>{hint}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-black text-neutral-950">Original</h2>
                            {file && (
                                <span className="truncate text-xs text-neutral-500">
                                    {file.name}
                                </span>
                            )}
                        </div>

                        <div className="flex min-h-96 items-center justify-center rounded-lg bg-neutral-100 p-4">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Original uploaded preview"
                                    className="max-h-[560px] max-w-full rounded-lg object-contain"
                                />
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Upload an image to preview it here.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <h2 className="text-lg font-black text-neutral-950">Aged result</h2>

                            {resultImage && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={openViewer}
                                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                                    >
                                        View full screen
                                    </button>

                                    <a
                                        href={resultImage}
                                        download={`aging-preview-${ageEffect}-years.jpg`}
                                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                                    >
                                        Download image
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex min-h-96 items-center justify-center rounded-lg bg-neutral-100 p-4">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3 text-sm font-semibold text-neutral-700">
                                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                                    Applying aging preview...
                                </div>
                            ) : resultImage ? (
                                <button
                                    type="button"
                                    onClick={openViewer}
                                    className="block max-h-[560px] max-w-full"
                                >
                                    <img
                                        src={resultImage}
                                        alt="Aging preview result"
                                        className="max-h-[560px] max-w-full rounded-lg object-contain"
                                    />
                                </button>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Your artistic aging preview will appear here.
                                </p>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {viewerImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col bg-black p-4 sm:p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-white">
                            Aging Preview Result
                        </h2>

                        <button
                            type="button"
                            onClick={closeViewer}
                            className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                        <img
                            src={viewerImage}
                            alt="Aging preview large result"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
