"use client";

import { useState } from "react";

type AgingAIResultProps = {
    imageUrl: string;
    onRegenerate: () => void;
    regenerating: boolean;
};

export function AgingAIResult({
                                  imageUrl,
                                  onRegenerate,
                                  regenerating
                              }: AgingAIResultProps) {
    const [viewerOpen, setViewerOpen] = useState(false);

    return (
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
                        Result
                    </p>
                    <h2 className="mt-1 text-xl font-black text-neutral-950">
                        AI age progression
                    </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setViewerOpen(true)}
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                    >
                        View full screen
                    </button>
                    <a
                        href={imageUrl}
                        download="portraitlab-ai-aging.png"
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                    >
                        Download image
                    </a>
                    <button
                        type="button"
                        onClick={onRegenerate}
                        disabled={regenerating}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {regenerating ? "Regenerating..." : "Regenerate variation"}
                    </button>
                </div>
            </div>

            <div className="flex min-h-[520px] items-center justify-center rounded-lg bg-neutral-100 p-4">
                <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="block max-h-[720px] max-w-full"
                >
                    <img
                        src={imageUrl}
                        alt="AI aging result"
                        className="max-h-[720px] max-w-full rounded-lg object-contain"
                    />
                </button>
            </div>

            {viewerOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col bg-black p-4 sm:p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-white">
                            AI Aging Result
                        </h2>
                        <button
                            type="button"
                            onClick={() => setViewerOpen(false)}
                            className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>
                    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
                        <img
                            src={imageUrl}
                            alt="AI aging result large preview"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
