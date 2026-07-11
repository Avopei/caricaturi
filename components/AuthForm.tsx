"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
    mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setErrorMessage("");

        const supabase = createClient();

        const result =
            mode === "sign-up"
                ? await supabase.auth.signUp({
                    email,
                    password
                })
                : await supabase.auth.signInWithPassword({
                    email,
                    password
                });

        setLoading(false);

        if (result.error) {
            setErrorMessage(result.error.message);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border border-neutral-300 bg-white p-6 text-neutral-950 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                PortraitLab Studio
            </p>
            <h1 className="mt-3 text-3xl font-black">
                {mode === "sign-up" ? "Create account" : "Sign in"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
                {mode === "sign-up"
                    ? "Create an account to save your caricatures and access the studio."
                    : "Sign in to access your AI portrait studio and saved generations."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        Email
                    </label>

                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-black"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        Password
                    </label>

                    <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-black"
                        placeholder="Minimum 8 characters"
                    />
                </div>

                {errorMessage && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-black px-5 py-3 font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading
                        ? "Processing..."
                        : mode === "sign-up"
                            ? "Create account"
                            : "Sign in"}
                </button>
            </form>
        </div>
    );
}
