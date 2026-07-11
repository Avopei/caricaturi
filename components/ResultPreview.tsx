import { useState } from "react";

import type {
    FeedbackRating,
    GenerationPaymentStatus
} from "@/types/caricature";

type ResultPreviewProps = {
    generationId: string | null;
    originalImage: string | null;
    previewImage: string | null;
    loading: boolean;
    demoMode: boolean;
    paymentStatus: GenerationPaymentStatus;
    feedbackRating: FeedbackRating | null;
    progressMessage?: string;
    isPro?: boolean;
    onUnlock: () => void;
    onRegenerate: () => void;
    onFeedback: (rating: FeedbackRating) => void;
};

type ZoomImage = {
    src: string;
    label: string;
};

export function ResultPreview({
                                  generationId,
                                  originalImage,
                                  previewImage,
                                  loading,
                                  demoMode,
                                  paymentStatus,
                                  feedbackRating,
                                  progressMessage,
                                  isPro = false,
                                  onUnlock,
                                  onRegenerate,
                                  onFeedback
                              }: ResultPreviewProps) {
    const [zoomImage, setZoomImage] = useState<ZoomImage | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const hasResult = Boolean(previewImage && generationId);
    const isPaid = paymentStatus === "paid";
    const canZoom = isPro || isPaid;

    function openZoom(src: string, label: string) {
        if (!canZoom) return;

        setZoomImage({ src, label });
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    }

    function closeZoom() {
        setZoomImage(null);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
        setDragging(false);
    }

    function zoomIn() {
        setZoomLevel((current) => Math.min(current + 0.25, 4));
    }

    function zoomOut() {
        setZoomLevel((current) => Math.max(current - 0.25, 1));
    }

    function resetZoom() {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    }

    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        if (zoomLevel <= 1) return;

        setDragging(true);
        setDragStart({
            x: event.clientX - position.x,
            y: event.clientY - position.y
        });
    }

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!dragging || zoomLevel <= 1) return;

        setPosition({
            x: event.clientX - dragStart.x,
            y: event.clientY - dragStart.y
        });
    }

    function handleMouseUp() {
        setDragging(false);
    }

    return (
        <section className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-black text-neutral-950">Result preview</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Your generated caricature will appear here.
                    </p>
                </div>

                {demoMode && (
                    <span className="w-fit rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-700">
            Demo mode
          </span>
                )}

                {!demoMode && hasResult && !isPaid && (
                    <span className="w-fit rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-700">
            Locked preview
          </span>
                )}

                {hasResult && isPaid && (
                    <span className="w-fit rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-700">
            Unlocked
          </span>
                )}
            </div>

            {!canZoom && hasResult && (
                <div className="mb-5 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                    Full screen zoom is available for Pro users or unlocked images.
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-neutral-700">Original photo</p>

                        {originalImage && canZoom && (
                            <button
                                type="button"
                                onClick={() => openZoom(originalImage, "Original photo")}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-bold text-neutral-950 hover:border-black"
                            >
                                Full screen
                            </button>
                        )}
                    </div>

                    <div className="flex min-h-[360px] items-center justify-center rounded-lg bg-white">
                        {originalImage ? (
                            <button
                                type="button"
                                onClick={() => openZoom(originalImage, "Original photo")}
                                disabled={!canZoom}
                                className="max-h-[520px] cursor-zoom-in disabled:cursor-default"
                            >
                                <img
                                    src={originalImage}
                                    alt="Original"
                                className="max-h-[520px] rounded-lg object-contain"
                                />
                            </button>
                        ) : (
                            <p className="px-6 text-center text-sm text-neutral-500">
                                Upload or take a photo first.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-neutral-700">Caricature</p>

                        {previewImage && canZoom && (
                            <button
                                type="button"
                                onClick={() => openZoom(previewImage, "Generated caricature")}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-bold text-neutral-950 hover:border-black"
                            >
                                Full screen
                            </button>
                        )}
                    </div>

                    <div className="relative flex min-h-[360px] items-center justify-center rounded-lg bg-white">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/70 px-6 text-center">
                                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />

                                <p className="text-sm font-bold text-white">
                                    {progressMessage || "Generating caricature..."}
                                </p>

                                <p className="mt-2 max-w-sm text-xs text-neutral-300">
                                    The AI is creating a new hand-drawn image. This can take a
                                    little while.
                                </p>
                            </div>
                        )}

                        {previewImage ? (
                            <button
                                type="button"
                                onClick={() => openZoom(previewImage, "Generated caricature")}
                                disabled={!canZoom}
                                className="max-h-[520px] cursor-zoom-in disabled:cursor-default"
                            >
                                <img
                                    src={previewImage}
                                    alt="Generated caricature"
                                className="max-h-[520px] rounded-lg object-contain"
                                />
                            </button>
                        ) : (
                            <p className="px-6 text-center text-sm text-neutral-500">
                                No result yet. Generate your first caricature.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-neutral-300 bg-neutral-50 p-4">
                <h3 className="font-black text-neutral-950">Actions</h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={onUnlock}
                        disabled={!hasResult || loading || isPaid}
                        className="rounded-lg bg-black px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPaid ? "Already unlocked" : "Unlock final image"}
                    </button>

                    <button
                        type="button"
                        onClick={onRegenerate}
                        disabled={!hasResult || loading}
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-950 hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Generate variation
                    </button>

                    <a
                        href={generationId ? `/api/download/${generationId}` : "#"}
                        className={`rounded-lg border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-bold text-neutral-950 hover:border-black ${
                            !generationId || !isPaid || loading
                                ? "pointer-events-none opacity-50"
                                : ""
                        }`}
                    >
                        Download final
                    </a>
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-neutral-300 bg-neutral-50 p-4">
                <h3 className="font-black text-neutral-950">Feedback</h3>

                <p className="mt-1 text-sm text-neutral-600">
                    Help us improve the caricature style.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onFeedback("good")}
                        disabled={!hasResult || loading}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            feedbackRating === "good"
                                ? "bg-black text-white"
                                : "border border-neutral-300 bg-white text-neutral-950 hover:border-black"
                        }`}
                    >
                        Looks good
                    </button>

                    <button
                        type="button"
                        onClick={() => onFeedback("needs_improvement")}
                        disabled={!hasResult || loading}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            feedbackRating === "needs_improvement"
                                ? "bg-black text-white"
                                : "border border-neutral-300 bg-white text-neutral-950 hover:border-black"
                        }`}
                    >
                        Needs improvement
                    </button>
                </div>

                {feedbackRating && (
                    <p className="mt-3 text-sm font-semibold text-neutral-700">
                        Feedback saved.
                    </p>
                )}
            </div>

            {zoomImage && (
                <div className="fixed inset-0 z-[100] bg-black/95">
                    <div className="absolute left-0 right-0 top-0 z-20 flex flex-col gap-3 border-b border-white/10 bg-neutral-950/90 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-lg font-black text-white">
                                {zoomImage.label}
                            </h3>
                            <p className="text-sm text-neutral-400">
                                Zoom, inspect details, and drag the image when zoomed in.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={zoomOut}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
                            >
                                Zoom -
                            </button>

                            <button
                                type="button"
                                onClick={resetZoom}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={zoomIn}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
                            >
                                Zoom +
                            </button>

                            <button
                                type="button"
                                onClick={closeZoom}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div
                        className={`flex h-screen w-screen items-center justify-center overflow-hidden pt-28 ${
                            zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            src={zoomImage.src}
                            alt={zoomImage.label}
                            draggable={false}
                            className="max-h-[calc(100vh-8rem)] max-w-[95vw] select-none object-contain transition-transform duration-150"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`
                            }}
                        />
                    </div>

                    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-neutral-950/90 px-4 py-2 text-sm font-bold text-white">
                        Zoom: {Math.round(zoomLevel * 100)}%
                    </div>
                </div>
            )}
        </section>
    );
}
