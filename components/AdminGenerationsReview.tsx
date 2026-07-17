"use client";

import { useEffect, useState } from "react";

type AdminGeneration = {
    id: string;
    userId: string;
    userEmail: string | null;
    tool: string;
    preset: string | null;
    previewImage: string | null;
    style: string | null;
    intensity: string | null;
    paymentStatus: string;
    feedbackRating: string | null;
    downloadCount: number;
    selectedForTraining: boolean;
    adminQualityRating: number | null;
    adminNotes: string | null;
    createdAt: string;
};

const PAGE_SIZE = 12;

export function AdminGenerationsReview() {
    const [generations, setGenerations] = useState<AdminGeneration[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadGenerations(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    async function loadGenerations(targetPage: number) {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch(
                `/api/admin/generations?page=${targetPage}&pageSize=${PAGE_SIZE}`
            );
            const data: {
                generations?: AdminGeneration[];
                total?: number;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load generations.");
            }

            setGenerations(data.generations || []);
            setTotal(data.total || 0);
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

    async function deleteGeneration(id: string) {
        setDeletingId(id);
        setErrorMessage("");

        try {
            const response = await fetch(`/api/admin/generations/${id}`, {
                method: "DELETE"
            });

            const data: { success?: boolean; error?: string } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not delete generation.");
            }

            setGenerations((current) => current.filter((item) => item.id !== id));
            setTotal((current) => Math.max(0, current - 1));
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not delete generation."
            );
        } finally {
            setDeletingId(null);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <section className="border border-line bg-paper p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="font-display text-2xl tracking-[-0.01em]">
                        Generation review
                    </h2>
                    <p className="mt-1 text-sm text-mute">
                        Select the best outputs for future LoRA dataset preparation, or
                        delete a generation entirely.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadGenerations(page)}
                    className="border border-line px-4 py-2 text-sm font-semibold transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                >
                    Refresh
                </button>
            </div>

            {errorMessage && (
                <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-mute">Loading generations...</p>
            ) : generations.length === 0 ? (
                <p className="mt-6 text-sm text-mute">No generations found.</p>
            ) : (
                <>
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {generations.map((generation) => (
                            <article key={generation.id} className="border border-line bg-surface p-4">
                                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                                    <div className="aspect-square overflow-hidden border border-line bg-paper">
                                        {generation.previewImage ? (
                                            <img
                                                src={generation.previewImage}
                                                alt="Generation preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-mute">
                                                No preview
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                                {generation.tool}
                                            </span>

                                            {generation.style && (
                                                <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                                    {generation.style}
                                                </span>
                                            )}

                                            {generation.preset && (
                                                <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                                    {generation.preset}
                                                </span>
                                            )}

                                            <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                                {generation.paymentStatus}
                                            </span>

                                            {generation.feedbackRating && (
                                                <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                                    {generation.feedbackRating}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 text-xs text-mute">
                                            User: {generation.userEmail || generation.userId}
                                        </p>

                                        <p className="mt-1 text-xs text-mute">
                                            Downloads: {generation.downloadCount}
                                        </p>

                                        <p className="mt-1 text-xs text-mute">
                                            Created:{" "}
                                            {new Date(generation.createdAt).toLocaleString("en-US")}
                                        </p>

                                        <div className="mt-4 grid gap-3">
                                            <label className="flex items-center gap-3 text-sm font-semibold">
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
                                                <label className="mb-2 block text-sm font-semibold">
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
                                                    className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
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
                                                <label className="mb-2 block text-sm font-semibold">
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
                                                    className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                                                    placeholder="Identity preservation, line quality, prompt issues..."
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => saveReview(generation)}
                                                    disabled={savingId === generation.id}
                                                    className="flex-1 border border-ink bg-ink px-4 py-3 text-sm font-semibold text-paper transition duration-300 ease-studio hover:bg-paper hover:text-ink disabled:opacity-50"
                                                >
                                                    {savingId === generation.id ? "Saving..." : "Save review"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteGeneration(generation.id)}
                                                    disabled={deletingId === generation.id}
                                                    className="border border-line px-4 py-3 text-sm font-semibold transition duration-300 ease-studio hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                                >
                                                    {deletingId === generation.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">
                        <p className="text-mute">
                            Page {page} of {totalPages} ({total} total)
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                className="border border-line px-4 py-2 font-semibold transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                className="border border-line px-4 py-2 font-semibold transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
