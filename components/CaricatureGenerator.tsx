"use client";

import { useEffect, useMemo, useState } from "react";
import { FaceControlsPanel } from "@/components/FaceControlsPanel";
import { GenerationHistory } from "@/components/GenerationHistory";
import { ImageUploader } from "@/components/ImageUploader";
import { PhotoGuidelines } from "@/components/PhotoGuidelines";
import { PlanStatusCard } from "@/components/PlanStatusCard";
import { ResultPreview } from "@/components/ResultPreview";
import { StyleSelector } from "@/components/StyleSelector";
import { compressImageFile } from "@/lib/client/compressImage";

import type {
    CaricatureIntensity,
    CaricatureStyle,
    FaceControls,
    FeedbackRating,
    GenerateResponse,
    GenerationPaymentStatus,
    GenerationsResponse,
    LocalGeneration,
    ProfilePlanInfo
} from "@/types/caricature";

const defaultFaceControls: FaceControls = {
    eyes: "normal",
    nose: "normal",
    jawline: "normal",
    expression: "preserve",
    headSize: "normal"
};

export function CaricatureGenerator() {
    const [faceControls, setFaceControls] =
        useState<FaceControls>(defaultFaceControls);

    const [file, setFile] = useState<File | null>(null);

    const [style, setStyle] =
        useState<CaricatureStyle>("realistic_human_drawn");

    const [intensity, setIntensity] =
        useState<CaricatureIntensity>("low");

    const [preview, setPreview] = useState<string | null>(null);
    const [selectedOriginalImage, setSelectedOriginalImage] =
        useState<string | null>(null);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [generationId, setGenerationId] = useState<string | null>(null);

    const [paymentStatus, setPaymentStatus] =
        useState<GenerationPaymentStatus>("unpaid");

    const [feedbackRating, setFeedbackRating] =
        useState<FeedbackRating | null>(null);

    const [demoMode, setDemoMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");
    const [historyLoading, setHistoryLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [generations, setGenerations] = useState<LocalGeneration[]>([]);

    const [planInfo, setPlanInfo] = useState<ProfilePlanInfo | null>(null);
    const [planLoading, setPlanLoading] = useState(true);

    const isPro = planInfo?.plan === "pro" || planInfo?.plan === "admin";

    const stats = useMemo(() => {
        const total = generations.length;

        const paid = generations.filter(
            (generation) => generation.paymentStatus === "paid"
        ).length;

        const unpaid = generations.filter(
            (generation) => generation.paymentStatus === "unpaid"
        ).length;

        const demo = generations.filter((generation) => generation.demo).length;

        return {
            total,
            paid,
            unpaid,
            demo
        };
    }, [generations]);

    useEffect(() => {
        loadGenerations();
        loadPlanInfo();
    }, []);

    async function loadPlanInfo() {
        setPlanLoading(true);

        try {
            const response = await fetch("/api/profile/plan");
            const data: ProfilePlanInfo & { error?: string } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load plan information.");
            }

            setPlanInfo(data);
        } catch {
            setPlanInfo(null);
        } finally {
            setPlanLoading(false);
        }
    }

    async function loadGenerations() {
        setHistoryLoading(true);

        try {
            const response = await fetch("/api/generations");
            const data: GenerationsResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load generation history.");
            }

            setGenerations(data.generations || []);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Could not load generation history."
            );
        } finally {
            setHistoryLoading(false);
        }
    }

    async function handleFileChange(file: File) {
        setErrorMessage("");
        setLoading(true);
        setProgressMessage("Preparing photo...");

        try {
            const compressedFile = await compressImageFile(file, {
                maxDimension: 1280,
                quality: 0.82
            });

            const localPreviewUrl = URL.createObjectURL(compressedFile);

            setFile(compressedFile);
            setPreview(localPreviewUrl);
            setSelectedOriginalImage(localPreviewUrl);
            setPreviewImage(null);
            setFinalImage(null);
            setGenerationId(null);
            setPaymentStatus("unpaid");
            setFeedbackRating(null);
            setDemoMode(false);
        } catch (error) {
            console.error(error);
            setErrorMessage("Could not prepare the image. Please try another photo.");
        } finally {
            setProgressMessage("");
            setLoading(false);
        }
    }

    async function generateCaricature() {
        if (!file) {
            setErrorMessage("Please upload or take a photo first.");
            return;
        }

        setLoading(true);
        setProgressMessage("Uploading photo...");
        setErrorMessage("");
        setPreviewImage(null);
        setFinalImage(null);
        setGenerationId(null);
        setPaymentStatus("unpaid");
        setFeedbackRating(null);
        setDemoMode(false);

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("style", style);
            formData.append("intensity", intensity);

            setProgressMessage("Generating caricature...");

            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData
            });

            setProgressMessage("Saving preview...");

            const text = await response.text();

            let data: GenerateResponse;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "The backend returned HTML instead of JSON. Check IntelliJ → Run."
                );
            }

            if (!response.ok) {
                throw new Error(data.error || "Generation failed.");
            }

            if (!data.previewImage || !data.generationId) {
                throw new Error("The backend did not return a complete generation.");
            }

            const newGeneration: LocalGeneration = {
                id: data.generationId,
                originalImage: data.originalImage || preview || selectedOriginalImage,
                previewImage: data.previewImage,
                style,
                intensity,
                paymentStatus: data.paymentStatus || "unpaid",
                demo: Boolean(data.demo),
                createdAt: new Date().toISOString(),
                feedbackRating: null
            };

            setSelectedOriginalImage(newGeneration.originalImage || null);
            setPreviewImage(newGeneration.previewImage);
            setFinalImage(null);
            setGenerationId(newGeneration.id);
            setPaymentStatus(newGeneration.paymentStatus);
            setFeedbackRating(null);
            setDemoMode(newGeneration.demo);

            setGenerations((current) => [newGeneration, ...current]);

            await loadPlanInfo();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setProgressMessage("");
            setLoading(false);
        }
    }

    async function handleUnlock() {
        if (!generationId) {
            alert("Generate a caricature first.");
            return;
        }

        try {
            const unlockResponse = await fetch(
                `/api/generations/${generationId}/unlock`,
                {
                    method: "POST"
                }
            );

            const unlockData: {
                success?: boolean;
                paymentStatus?: GenerationPaymentStatus;
                error?: string;
            } = await unlockResponse.json();

            if (!unlockResponse.ok) {
                throw new Error(unlockData.error || "Could not unlock image.");
            }

            const finalResponse = await fetch(`/api/generations/${generationId}/final`);

            const finalData: {
                finalImage?: string;
                error?: string;
            } = await finalResponse.json();

            if (!finalResponse.ok || !finalData.finalImage) {
                throw new Error(finalData.error || "Could not load final image.");
            }

            setPaymentStatus("paid");
            setFinalImage(finalData.finalImage);

            setGenerations((current) =>
                current.map((generation) =>
                    generation.id === generationId
                        ? {
                            ...generation,
                            paymentStatus: "paid"
                        }
                        : generation
                )
            );

            alert("Image unlocked. You are now viewing the version without watermark.");
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not unlock image."
            );
        }
    }

    async function handleRegenerate() {
        setErrorMessage("");

        if (file) {
            await generateCaricature();
            return;
        }

        if (!generationId) {
            setErrorMessage("Select a generation first.");
            return;
        }

        setLoading(true);
        setProgressMessage("Generating variation...");

        try {
            const response = await fetch(`/api/generations/${generationId}/regenerate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    style,
                    intensity
                })
            });

            setProgressMessage("Saving variation...");

            const text = await response.text();

            let data: GenerateResponse;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "The backend returned HTML instead of JSON. Check IntelliJ → Run."
                );
            }

            if (!response.ok) {
                throw new Error(data.error || "Regeneration failed.");
            }

            if (!data.previewImage || !data.generationId) {
                throw new Error("The backend did not return a complete regeneration.");
            }

            const newGeneration: LocalGeneration = {
                id: data.generationId,
                originalImage: data.originalImage || selectedOriginalImage,
                previewImage: data.previewImage,
                style,
                intensity,
                paymentStatus: data.paymentStatus || "unpaid",
                demo: Boolean(data.demo),
                createdAt: new Date().toISOString(),
                feedbackRating: null
            };

            setSelectedOriginalImage(newGeneration.originalImage || null);
            setPreviewImage(newGeneration.previewImage);
            setFinalImage(null);
            setGenerationId(newGeneration.id);
            setPaymentStatus(newGeneration.paymentStatus);
            setFeedbackRating(null);
            setDemoMode(newGeneration.demo);

            setGenerations((current) => [newGeneration, ...current]);

            await loadPlanInfo();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not regenerate image."
            );
        } finally {
            setProgressMessage("");
            setLoading(false);
        }
    }

    async function handleFeedback(rating: FeedbackRating) {
        if (!generationId) {
            setErrorMessage("No generation selected.");
            return;
        }

        try {
            const response = await fetch(`/api/generations/${generationId}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rating
                })
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not save feedback.");
            }

            setFeedbackRating(rating);

            setGenerations((current) =>
                current.map((generation) =>
                    generation.id === generationId
                        ? {
                            ...generation,
                            feedbackRating: rating
                        }
                        : generation
                )
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not save feedback."
            );
        }
    }

    async function handleClearHistory() {
        const confirmed = window.confirm(
            "Clear your entire generation history? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch("/api/generations/clear", {
                method: "DELETE"
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not clear history.");
            }

            setGenerations([]);
            setPreviewImage(null);
            setFinalImage(null);
            setGenerationId(null);
            setPaymentStatus("unpaid");
            setFeedbackRating(null);
            setDemoMode(false);
            setSelectedOriginalImage(preview);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not clear history."
            );
        }
    }

    async function handleDeleteGeneration(id: string) {
        const confirmed = window.confirm(
            "Delete this generation? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/generations/${id}`, {
                method: "DELETE"
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not delete generation.");
            }

            setGenerations((current) =>
                current.filter((generation) => generation.id !== id)
            );

            if (generationId === id) {
                setPreviewImage(null);
                setFinalImage(null);
                setGenerationId(null);
                setPaymentStatus("unpaid");
                setFeedbackRating(null);
                setDemoMode(false);
                setSelectedOriginalImage(preview);
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not delete generation."
            );
        }
    }

    function handleSelectGeneration(generation: LocalGeneration) {
        setFile(null);
        setSelectedOriginalImage(generation.originalImage || null);
        setPreviewImage(generation.previewImage);
        setFinalImage(null);
        setGenerationId(generation.id);
        setPaymentStatus(generation.paymentStatus);
        setFeedbackRating(generation.feedbackRating || null);
        setDemoMode(generation.demo);
        setStyle(generation.style);
        setIntensity(generation.intensity);
        setErrorMessage("");
    }

    return (
        <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-950 shadow-sm sm:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_380px]">
                    <header className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-4 inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-600">
                            Caricature Studio
                        </div>

                        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-neutral-950 md:text-6xl">
                            Create a hand-drawn caricature
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 md:text-lg">
                            Upload or take a portrait photo, choose a style, and generate a preview.
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    Style
                                </p>
                                <p className="mt-2 font-black text-neutral-950">Hand-drawn</p>
                            </div>

                            <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    Output
                                </p>
                                <p className="mt-2 font-black text-neutral-950">Preview + final</p>
                            </div>

                            <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    Pro
                                </p>
                                <p className="mt-2 font-black text-neutral-950">Style controls</p>
                            </div>
                        </div>
                    </header>

                    <PlanStatusCard planInfo={planInfo} loading={planLoading} />
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-neutral-300 bg-white p-5">
                        <p className="text-sm text-neutral-500">Total</p>
                        <p className="mt-2 text-3xl font-black text-neutral-950">{stats.total}</p>
                    </div>

                    <div className="rounded-lg border border-neutral-300 bg-white p-5">
                        <p className="text-sm text-neutral-500">Locked</p>
                        <p className="mt-2 text-3xl font-black text-neutral-950">
                            {stats.unpaid}
                        </p>
                    </div>

                    <div className="rounded-lg border border-neutral-300 bg-white p-5">
                        <p className="text-sm text-neutral-500">Unlocked</p>
                        <p className="mt-2 text-3xl font-black text-neutral-950">
                            {stats.paid}
                        </p>
                    </div>

                    <div className="rounded-lg border border-neutral-300 bg-white p-5">
                        <p className="text-sm text-neutral-500">Demo</p>
                        <p className="mt-2 text-3xl font-black text-neutral-950">
                            {stats.demo}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
                    <aside className="space-y-6">
                        <ImageUploader preview={preview} onFileChange={handleFileChange} />

                        {errorMessage && (
                            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={generateCaricature}
                            disabled={loading || !file}
                            className="w-full rounded-lg bg-black px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? progressMessage || "Generating..." : "Generate caricature"}
                        </button>

                        <PhotoGuidelines />

                        <StyleSelector
                            style={style}
                            intensity={intensity}
                            isPro={isPro}
                            onStyleChange={setStyle}
                            onIntensityChange={setIntensity}
                        />

                        <FaceControlsPanel
                            value={faceControls}
                            isPro={isPro}
                            onChange={setFaceControls}
                        />
                    </aside>

                    <ResultPreview
                        generationId={generationId}
                        originalImage={selectedOriginalImage}
                        previewImage={finalImage ?? previewImage ?? null}
                        loading={loading}
                        demoMode={demoMode}
                        paymentStatus={paymentStatus}
                        feedbackRating={feedbackRating}
                        isPro={isPro}

                        progressMessage={progressMessage}
                        onUnlock={handleUnlock}
                        onRegenerate={handleRegenerate}
                        onFeedback={handleFeedback}
                    />
                </div>

                <div id="history">
                    {historyLoading ? (
                        <section className="mt-8 rounded-xl border border-neutral-300 bg-white p-8 text-center text-neutral-500">
                            Loading history...
                        </section>
                    ) : (
                        <GenerationHistory
                            generations={generations}
                            onSelectGeneration={handleSelectGeneration}
                            onDeleteGeneration={handleDeleteGeneration}
                            onClearHistory={handleClearHistory}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
