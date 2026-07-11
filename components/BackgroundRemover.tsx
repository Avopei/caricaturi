"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";

type RemoveBackgroundResponse = {
    resultImage?: string;
    filePath?: string;
    error?: string;
};

export default function BackgroundRemover() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [resultPath, setResultPath] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [viewerOpen, setViewerOpen] = useState(false);

    function handleFileChange(nextFile: File) {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(nextFile);
        setPreview(URL.createObjectURL(nextFile));
        setResultImage(null);
        setResultPath(null);
        setErrorMessage("");
        setViewerOpen(false);
    }

    async function removeBackground() {
        if (!file) {
            setErrorMessage("Upload an image before removing the background.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/background/remove", {
                method: "POST",
                body: formData
            });

            const data = (await response.json()) as RemoveBackgroundResponse;

            if (!response.ok) {
                throw new Error(data.error || "Could not remove the background.");
            }

            if (!data.resultImage) {
                throw new Error("The background remover did not return an image.");
            }

            setResultImage(data.resultImage);
            setResultPath(data.filePath || null);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Could not remove the background."
            );
        } finally {
            setLoading(false);
        }
    }

    function openViewer() {
        if (resultImage) {
            setViewerOpen(true);
        }
    }

    function closeViewer() {
        setViewerOpen(false);
    }

    return (
        <div className="min-h-[calc(100vh-7rem)] rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-950 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                    Studio workspace
                </p>
                <h1 className="mt-2 text-4xl font-black text-neutral-950 md:text-5xl">Background Remover</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                    Remove the background while keeping the subject unchanged.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <div className="space-y-4">
                    <ImageUploader preview={preview} onFileChange={handleFileChange} />

                    <button
                        type="button"
                        onClick={removeBackground}
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-3 text-center font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Removing background..." : "Remove background"}
                    </button>

                    {errorMessage && (
                        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}
                </div>

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
                            <div>
                                <h2 className="text-lg font-black text-neutral-950">Result</h2>
                                {resultPath && (
                                    <p className="mt-1 text-xs text-neutral-500">Saved</p>
                                )}
                            </div>

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
                                        download="background-removed.png"
                                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                                    >
                                        Download PNG
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex min-h-96 items-center justify-center rounded-lg bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%),linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] p-4">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3 text-sm font-semibold text-neutral-700">
                                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                                    Removing background...
                                </div>
                            ) : resultImage ? (
                                <button
                                    type="button"
                                    onClick={openViewer}
                                    className="block max-h-[560px] max-w-full"
                                >
                                    <img
                                        src={resultImage}
                                        alt="Background removed result"
                                        className="max-h-[560px] max-w-full rounded-lg object-contain"
                                    />
                                </button>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Your cleaned image will appear here.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {viewerOpen && resultImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col bg-black p-4 sm:p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-white">
                            Background Removed
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
                            src={resultImage}
                            alt="Background removed large preview"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
