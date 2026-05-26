"use client";

import { useState } from "react";

export function ProWaitlistButton() {
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function joinWaitlist() {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST"
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not join the Pro waitlist.");
            }

            setJoined(true);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not join waitlist."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-bold text-violet-700">Pro waitlist</p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
                Get early access to Pro
            </h2>

            <p className="mt-2 leading-7 text-slate-600">
                Join the waitlist for HD exports, no watermark, premium styles,
                regenerate variations, and the future trained LoRA caricature model.
            </p>

            {joined ? (
                <div className="mt-5 rounded-2xl bg-emerald-100 px-5 py-4 font-bold text-emerald-800">
                    You are on the Pro waitlist.
                </div>
            ) : (
                <button
                    type="button"
                    onClick={joinWaitlist}
                    disabled={loading}
                    className="mt-5 rounded-2xl bg-violet-600 px-6 py-4 font-black text-white hover:bg-violet-700 disabled:opacity-50"
                >
                    {loading ? "Joining..." : "Join Pro waitlist"}
                </button>
            )}

            {errorMessage && (
                <p className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}