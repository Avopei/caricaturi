"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";

type AgeEffect = "10" | "20" | "30";

const ageOptions: Array<{ value: AgeEffect; label: string }> = [
    { value: "10", label: "+10 years" },
    { value: "20", label: "+20 years" },
    { value: "30", label: "+30 years" }
];

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

export default function AgingPreview() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [ageEffect, setAgeEffect] = useState<AgeEffect>("10");
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    function handleFileChange(nextFile: File) {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(nextFile);
        setPreview(URL.createObjectURL(nextFile));
        setResultImage(null);
        setErrorMessage("");
        setViewerImage(null);
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
        <div className="min-h-[calc(100vh-7rem)] rounded-[2rem] bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-white">Aging Preview</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Apply a fast artistic future-look simulation in the browser.
                </p>
                <p className="mt-3 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100">
                    This is an artistic age simulation, not a biological prediction.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <div className="space-y-4">
                    <ImageUploader preview={preview} onFileChange={handleFileChange} />

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <h2 className="text-lg font-bold text-white">2. Choose age</h2>
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
                                                ? "border-violet-400 bg-violet-600 text-white"
                                                : "border-white/10 text-slate-300 hover:bg-white/10"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={applyAging}
                        disabled={loading}
                        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-center font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Applying aging preview..." : "Apply aging preview"}
                    </button>

                    {errorMessage && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-white">Original</h2>
                            {file && (
                                <span className="truncate text-xs text-slate-500">
                                    {file.name}
                                </span>
                            )}
                        </div>

                        <div className="flex min-h-96 items-center justify-center rounded-2xl bg-black/40 p-4">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Original uploaded preview"
                                    className="max-h-[560px] max-w-full rounded-xl object-contain"
                                />
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Upload an image to preview it here.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <h2 className="text-lg font-bold text-white">Aged result</h2>

                            {resultImage && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={openViewer}
                                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
                                    >
                                        View full screen
                                    </button>

                                    <a
                                        href={resultImage}
                                        download={`aging-preview-${ageEffect}-years.jpg`}
                                        className="rounded-xl border border-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/10"
                                    >
                                        Download image
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex min-h-96 items-center justify-center rounded-2xl bg-black/40 p-4">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3 text-sm font-semibold text-white">
                                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
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
                                        className="max-h-[560px] max-w-full rounded-xl object-contain"
                                    />
                                </button>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Your artistic aging preview will appear here.
                                </p>
                            )}
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
