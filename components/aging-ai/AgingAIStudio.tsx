"use client";

import { useEffect, useState } from "react";
import { AgingAIResult } from "@/components/aging-ai/AgingAIResult";
import { AgingPresetSelector } from "@/components/aging-ai/AgingPresetSelector";
import { AgingPromptPreview } from "@/components/aging-ai/AgingPromptPreview";
import type { AgingAIResponse, AgingPreset } from "@/lib/aging-ai/types";

export default function AgingAIStudio() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [agePreset, setAgePreset] = useState<AgingPreset>("age_20");
    const [imageUrl, setImageUrl] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    function handleFileChange(nextFile?: File) {
        if (!nextFile) return;

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(nextFile);
        setPreview(URL.createObjectURL(nextFile));
        setImageUrl("");
        setPrompt("");
        setErrorMessage("");
    }

    async function generateAging() {
        if (!file) {
            setErrorMessage("Upload a portrait before generating AI aging.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("agePreset", agePreset);

            const response = await fetch("/api/aging-ai/generate", {
                method: "POST",
                body: formData
            });
            const data = (await response.json()) as AgingAIResponse;

            if (!response.ok || !data.ok || !data.imageUrl) {
                throw new Error(data.error || "AI aging could not generate a result.");
            }

            setImageUrl(data.imageUrl);
            setPrompt(data.prompt || "");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "AI aging could not generate a result."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
                <div className="space-y-4">
                    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-neutral-950">
                            1. Upload portrait
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                            Use a clear face-forward photo for the most realistic age
                            progression.
                        </p>

                        <label className="mt-5 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-neutral-100 p-6 text-center hover:border-black hover:bg-neutral-50">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Original portrait preview"
                                    className="max-h-80 max-w-full rounded-lg object-contain"
                                />
                            ) : (
                                <>
                                    <div className="mb-3 h-16 w-12 rounded-t-full bg-neutral-950" />
                                    <span className="font-semibold text-neutral-950">
                                        Upload portrait
                                    </span>
                                    <span className="mt-1 text-sm text-neutral-500">
                                        JPG, PNG, or WEBP
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    handleFileChange(event.target.files?.[0]);
                                    event.target.value = "";
                                }}
                            />
                        </label>

                        {file && (
                            <p className="mt-3 truncate text-xs text-neutral-500">
                                {file.name}
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-neutral-950">
                            2. Choose age preset
                        </h2>
                        <div className="mt-4">
                            <AgingPresetSelector
                                selectedPreset={agePreset}
                                onPresetChange={setAgePreset}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={generateAging}
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-4 text-center font-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Creating realistic age progression..."
                            : "Generate AI aging"}
                    </button>

                    {errorMessage && (
                        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {loading && !imageUrl ? (
                        <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
                            <div className="flex flex-col items-center gap-3 text-sm font-semibold text-neutral-700">
                                <span className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                                Creating realistic age progression...
                            </div>
                        </div>
                    ) : imageUrl ? (
                        <AgingAIResult
                            imageUrl={imageUrl}
                            onRegenerate={generateAging}
                            regenerating={loading}
                        />
                    ) : (
                        <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-neutral-300 bg-white p-6 text-center shadow-sm">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                                    Awaiting generation
                                </p>
                                <h2 className="mt-3 text-3xl font-black text-neutral-950">
                                    Your realistic older portrait will appear here.
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                                    The AI aging result is generated by a dedicated
                                    external image provider, not by canvas wrinkle
                                    overlays.
                                </p>
                            </div>
                        </div>
                    )}

                    <AgingPromptPreview prompt={prompt} />
                </div>
            </div>
        </div>
    );
}
