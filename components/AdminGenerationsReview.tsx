"use client";

import { useEffect, useState } from "react";

type AdminGeneration = {
    id: string;
    userId: string;
    previewImage: string | null;
    style: string;
    intensity: string;
    paymentStatus: string;
    feedbackRating: string | null;
    downloadCount: number;
    selectedForTraining: boolean;
    adminQualityRating: number | null;
    adminNotes: string | null;
    createdAt: string;
};

export function AdminGenerationsReview() {
    const [generations, setGenerations] = useState<AdminGeneration[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadGenerations();
    }, []);

    async function loadGenerations() {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/generations");
            const data: {
                generations?: AdminGeneration[];
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load generations.");
            }

            setGenerations(data.generations || []);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not load generations."
            );
        } finally {
            setLoading(false);
        }
    }

    function updateLocalGeneration(
        id: string,
        patch: Partial<AdminGeneration>
    ) {
        setGenerations((current) =>
            current.map((generation) =>
                generation.id === id
                    ? {
                        ...generation,
                        ...patch
                    }
                    : generation
            )
        );
    }

    async function saveReview(generation: AdminGeneration) {
        setSavingId(generation.id);
        setErrorMessage("");

        try {
            const response = await fetch(
                `/api/admin/generations/${generation.id}/review`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        selectedForTraining: generation.selectedForTraining,
                        adminQualityRating: generation.adminQualityRating,
                        adminNotes: generation.adminNotes
                    })
                }
            );

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not save review.");
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not save review."
            );
        } finally {
            setSavingId(null);
        }
    }

    return (
        <section className="mx-auto mt-8 max-w-7xl rounded-xl border border-neutral-300 bg-white p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-black">Generation review</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Select the best outputs for future LoRA dataset preparation.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadGenerations}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-950 hover:bg-neutral-100"
                >
                    Refresh
                </button>
            </div>

            {errorMessage && (
                <div className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-neutral-500">Loading generations...</p>
            ) : generations.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">No generations found.</p>
            ) : (
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {generations.map((generation) => (
                        <article
                            key={generation.id}
                            className="rounded-xl border border-neutral-300 bg-neutral-50 p-4"
                        >
                            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                                <div className="aspect-square overflow-hidden rounded-lg bg-white">
                                    {generation.previewImage ? (
                                        <img
                                            src={generation.previewImage}
                                            alt="Generation preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                                            No preview
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                      {generation.style}
                    </span>

                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                      {generation.intensity}
                    </span>

                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                      {generation.paymentStatus}
                    </span>

                                        {generation.feedbackRating && (
                                            <span className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                        {generation.feedbackRating}
                      </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-xs text-neutral-500">
                                        User: {generation.userId}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Downloads: {generation.downloadCount}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Created:{" "}
                                        {new Date(generation.createdAt).toLocaleString("en-US")}
                                    </p>

                                    <div className="mt-4 grid gap-3">
                                        <label className="flex items-center gap-3 text-sm font-bold text-neutral-950">
                                            <input
                                                type="checkbox"
                                                checked={generation.selectedForTraining}
                                                onChange={(event) =>
                                                    updateLocalGeneration(generation.id, {
                                                        selectedForTraining: event.target.checked
                                                    })
                                                }
                                            />
                                            Select for LoRA training dataset
                                        </label>

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-neutral-700">
                                                Admin quality rating
                                            </label>

                                            <select
                                                value={generation.adminQualityRating || ""}
                                                onChange={(event) =>
                                                    updateLocalGeneration(generation.id, {
                                                        adminQualityRating: event.target.value
                                                            ? Number(event.target.value)
                                                            : null
                                                    })
                                                }
                                                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-950 outline-none focus:border-black"
                                            >
                                                <option value="">No rating</option>
                                                <option value="1">1 — Bad</option>
                                                <option value="2">2 — Weak</option>
                                                <option value="3">3 — Usable</option>
                                                <option value="4">4 — Good</option>
                                                <option value="5">5 — Excellent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-neutral-700">
                                                Admin notes
                                            </label>

                                            <textarea
                                                value={generation.adminNotes || ""}
                                                onChange={(event) =>
                                                    updateLocalGeneration(generation.id, {
                                                        adminNotes: event.target.value
                                                    })
                                                }
                                                rows={3}
                                                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-950 outline-none focus:border-black"
                                                placeholder="Identity preservation, line quality, prompt issues..."
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => saveReview(generation)}
                                            disabled={savingId === generation.id}
                                            className="rounded-xl bg-black px-4 py-3 text-sm font-black text-neutral-950 hover:bg-neutral-800 disabled:opacity-50"
                                        >
                                            {savingId === generation.id ? "Saving..." : "Save review"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
