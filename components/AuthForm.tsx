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
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white">
            <h1 className="text-3xl font-black">
                {mode === "sign-up" ? "Create account" : "Sign in"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
                {mode === "sign-up"
                    ? "Create an account to save your caricatures and access the studio."
                    : "Sign in to access your AI portrait studio and saved generations."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Email
                    </label>

                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Password
                    </label>

                    <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                        placeholder="Minimum 8 characters"
                    />
                </div>

                {errorMessage && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
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