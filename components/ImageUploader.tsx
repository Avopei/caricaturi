"use client";

import { useEffect, useRef, useState } from "react";

type ImageUploaderProps = {
    preview: string | null;
    onFileChange: (file: File) => void;
};

export function ImageUploader({ preview, onFileChange }: ImageUploaderProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    function handleSelectedFile(file?: File) {
        if (!file) return;
        onFileChange(file);
    }

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);
        setCameraReady(false);
    }

    async function openCamera() {
        setCameraError(null);
        setCameraReady(false);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError(
                "Camera is not supported in this browser. Try Chrome, Edge, Safari, or use Upload photo."
            );
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 1280 }
                },
                audio: false
            });

            streamRef.current = mediaStream;
            setCameraOpen(true);

            setTimeout(async () => {
                if (!videoRef.current) return;

                videoRef.current.srcObject = mediaStream;

                try {
                    await videoRef.current.play();
                    setCameraReady(true);
                } catch {
                    setCameraError(
                        "Camera opened, but video could not start. Please allow camera permission and try again."
                    );
                }
            }, 100);
        } catch (error) {
            console.error(error);
            setCameraError(
                "Camera could not be opened. Please allow camera permission in your browser."
            );
        }
    }

    function capturePhoto() {
        const video = videoRef.current;

        if (!video || !cameraReady) {
            setCameraError("Camera is not ready yet. Please wait one second.");
            return;
        }

        const width = video.videoWidth || 1024;
        const height = video.videoHeight || 1024;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
            setCameraError("Could not capture the photo.");
            return;
        }

        context.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setCameraError("Could not save the captured photo.");
                    return;
                }

                const file = new File([blob], `live-camera-photo-${Date.now()}.jpg`, {
                    type: "image/jpeg"
                });

                onFileChange(file);
                stopCamera();
            },
            "image/jpeg",
            0.92
        );
    }

    useEffect(() => {
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">1. Add photo</h2>

            <p className="mt-1 text-sm text-slate-400">
                Upload a portrait or take a live photo directly with your camera.
                Supported formats: JPG, PNG, WEBP.
            </p>

            <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-6 text-center">
                {preview ? (
                    <img
                        src={preview}
                        alt="Original photo preview"
                        className="max-h-72 rounded-xl object-contain"
                    />
                ) : (
                    <>
                        <div className="mb-3 text-4xl">📷</div>
                        <p className="font-semibold text-white">Upload or take a photo</p>
                        <p className="mt-1 text-sm text-slate-500">Maximum 8MB</p>
                    </>
                )}
            </div>

            {cameraError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {cameraError}
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="cursor-pointer rounded-xl border border-white/10 px-5 py-3 text-center font-semibold text-white hover:bg-white/10">
                    Upload photo

                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            handleSelectedFile(event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                </label>

                <button
                    type="button"
                    onClick={openCamera}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold text-white hover:bg-violet-700"
                >
                    Take photo
                </button>
            </div>

            {preview && (
                <p className="mt-3 text-center text-xs text-slate-500">
                    You can replace this image by uploading a new one or taking another
                    photo.
                </p>
            )}

            {cameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Live camera
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Position your face clearly, then capture the photo.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={stopCamera}
                                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
                            >
                                Close
                            </button>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                            {!cameraReady && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                                    Starting camera...
                                </div>
                            )}

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="max-h-[70vh] w-full bg-black object-contain"
                            />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={capturePhoto}
                                disabled={!cameraReady}
                                className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Capture photo
                            </button>

                            <button
                                type="button"
                                onClick={stopCamera}
                                className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-white hover:bg-white/10"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}