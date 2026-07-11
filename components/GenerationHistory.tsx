"use client";

import { useState } from "react";
import { intensityOptions, styleOptions } from "@/lib/constants";
import type { LocalGeneration } from "@/types/caricature";

type GenerationHistoryProps = {
    generations: LocalGeneration[];
    onSelectGeneration: (generation: LocalGeneration) => void;
    onDeleteGeneration: (generationId: string) => void;
    onClearHistory: () => void;
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(date));
}

function getStyleLabel(style: LocalGeneration["style"]) {
    return styleOptions.find((item) => item.value === style)?.label || style;
}

function getIntensityLabel(intensity: LocalGeneration["intensity"]) {
    return (
        intensityOptions.find((item) => item.value === intensity)?.label || intensity
    );
}

export function GenerationHistory({
                                      generations,
                                      onSelectGeneration,
                                      onDeleteGeneration,
                                      onClearHistory
                                  }: GenerationHistoryProps) {
    const [viewerImage, setViewerImage] = useState<LocalGeneration | null>(null);

    return (
        <section className="mt-8 rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-black text-neutral-950">
                        Generation history
                    </h2>

                    <p className="mt-1 text-sm text-neutral-600">
                        Your latest generated caricatures.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
                        {generations.length} generated
                    </span>

                    {generations.length > 0 && (
                        <>
                            <a
                                href="/api/generations/export"
                                download
                                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                            >
                                Download history
                            </a>

                            <button
                                type="button"
                                onClick={onClearHistory}
                                className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                            >
                                Clear history
                            </button>
                        </>
                    )}
                </div>
            </div>

            {generations.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                    <p className="font-semibold text-neutral-700">
                        No caricatures generated yet.
                    </p>

                    <p className="mt-2 text-sm text-neutral-500">
                        Your previews will appear here after your first generation.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {generations.map((generation) => {
                        const styleLabel = getStyleLabel(generation.style);
                        const intensityLabel = getIntensityLabel(generation.intensity);
                        const isPaid = generation.paymentStatus === "paid";

                        return (
                            <div
                                key={generation.id}
                                className="overflow-hidden rounded-xl border border-neutral-300 bg-white"
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewerImage(generation)}
                                    className="block w-full text-left transition hover:bg-neutral-50"
                                >
                                    <div className="aspect-square bg-white">
                                        {generation.previewImage ? (
                                            <img
                                                src={generation.previewImage}
                                                alt="Generated caricature preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                                                Preview unavailable
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-neutral-950">
                                                {styleLabel}
                                            </p>

                                            <span
                                                className={
                                                    isPaid
                                                        ? "rounded-full border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700"
                                                        : "rounded-full border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700"
                                                }
                                            >
                                                {isPaid ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        <p className="text-xs text-neutral-600">
                                            Intensity: {intensityLabel}
                                        </p>

                                        <p className="text-xs text-neutral-500">
                                            {formatDate(generation.createdAt)}
                                        </p>

                                        {generation.demo && (
                                            <p className="text-xs text-neutral-600">Demo mode</p>
                                        )}

                                        {generation.feedbackRating && (
                                            <p className="text-xs text-neutral-600">
                                                Feedback:{" "}
                                                {generation.feedbackRating === "good"
                                                    ? "Looks good"
                                                    : "Needs improvement"}
                                            </p>
                                        )}
                                    </div>
                                </button>

                                <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 p-3">
                                    <button
                                        type="button"
                                        onClick={() => onSelectGeneration(generation)}
                                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                                    >
                                        Open
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewerImage(generation)}
                                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                                    >
                                        View
                                    </button>

                                    {isPaid ? (
                                        <a
                                            href={`/api/download/${generation.id}`}
                                            className="rounded-lg border border-neutral-300 px-3 py-2 text-center text-sm font-bold text-neutral-700 hover:border-black"
                                        >
                                            Download
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="cursor-not-allowed rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-400"
                                        >
                                            Download
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => onDeleteGeneration(generation.id)}
                                        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewerImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col bg-black p-4 sm:p-6"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-xl font-black text-white">
                                {getStyleLabel(viewerImage.style)}
                            </h3>

                            <p className="mt-1 text-sm text-neutral-400">
                                {getIntensityLabel(viewerImage.intensity)} intensity ·{" "}
                                {formatDate(viewerImage.createdAt)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setViewerImage(null)}
                            className="self-start rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                        {viewerImage.previewImage ? (
                            <img
                                src={viewerImage.previewImage}
                                alt="Generated caricature preview"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <div className="rounded-lg border border-white/10 px-8 py-6 text-sm text-neutral-400">
                                Preview unavailable
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
