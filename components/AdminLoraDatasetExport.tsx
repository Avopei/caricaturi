"use client";

import { useState } from "react";

type LoraDatasetItem = {
    id: string;
    originalImage: string | null;
    finalImage: string | null;
    previewImage: string | null;
    style: string;
    intensity: string;
    promptUsed: string | null;
    feedbackRating: string | null;
    downloadCount: number;
    adminQualityRating: number | null;
    adminNotes: string | null;
    createdAt: string;
};

export function AdminLoraDatasetExport() {
    const [loading, setLoading] = useState(false);
    const [dataset, setDataset] = useState<LoraDatasetItem[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadDataset() {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/lora-dataset");
            const data: {
                count?: number;
                dataset?: LoraDatasetItem[];
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load LoRA dataset.");
            }

            setDataset(data.dataset || []);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not load LoRA dataset."
            );
        } finally {
            setLoading(false);
        }
    }

    function downloadJson() {
        const blob = new Blob(
            [
                JSON.stringify(
                    {
                        exportedAt: new Date().toISOString(),
                        count: dataset.length,
                        dataset
                    },
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `lora-dataset-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    return (
        <section className="mx-auto mt-8 max-w-7xl rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-black">LoRA dataset export</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Export selected training candidates as JSON for future LoRA dataset
                        preparation.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadDataset}
                        disabled={loading}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load selected"}
                    </button>

                    <button
                        type="button"
                        onClick={downloadJson}
                        disabled={dataset.length === 0}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        Download JSON
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = "/api/admin/lora-dataset/zip";
                        }}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-white hover:bg-emerald-600"
                    >
                        Download ZIP
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">Selected items</p>
                <p className="mt-2 text-4xl font-black text-white">{dataset.length}</p>
            </div>

            {dataset.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {dataset.slice(0, 6).map((item) => (
                        <article
                            key={item.id}
                            className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                        >
                            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                                <div className="aspect-square overflow-hidden rounded-xl bg-white">
                                    {item.previewImage ? (
                                        <img
                                            src={item.previewImage}
                                            alt="Selected LoRA dataset preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                                            No preview
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-white">{item.style}</p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Rating: {item.adminQualityRating || "none"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Downloads: {item.downloadCount}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Feedback: {item.feedbackRating || "none"}
                                    </p>

                                    {item.adminNotes && (
                                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                                            {item.adminNotes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}