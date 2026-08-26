"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
    mode: "sign-in" | "sign-up";
};

function mapAuthError(error: unknown): string {
    if (!(error instanceof Error) || !error.message) {
        return "Something went wrong. Please try again.";
    }

    const message = error.message.toLowerCase();

    if (
        message.includes("invalid login credentials") ||
        message.includes("invalid email or password")
    ) {
        return "Email or password is incorrect.";
    }

    if (message.includes("email not confirmed")) {
        return "Confirm your email before signing in — check your inbox for the link.";
    }

    if (message.includes("already registered") || message.includes("already exists")) {
        return "An account with this email already exists.";
    }

    if (message.includes("rate limit") || message.includes("too many requests")) {
        return "Too many attempts. Wait a moment and try again.";
    }

    if (message.includes("failed to fetch") || message.includes("network")) {
        return "Connection problem. Check your connection and try again.";
    }

    if (message.includes("password") && message.includes("least")) {
        return "Password must be at least 8 characters.";
    }

    return error.message;
}

export function AuthForm(props: AuthFormProps) {
    return (
        <Suspense fallback={null}>
            <AuthFormInner {...props} />
        </Suspense>
    );
}

function AuthFormInner({ mode }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        searchParams.get("error") || ""
    );
    const [checkEmail, setCheckEmail] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const supabase = createClient();

            if (mode === "sign-up") {
                const result = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                });

                if (result.error) {
                    setErrorMessage(mapAuthError(result.error));
                    return;
                }

                if (result.data.session) {
                    router.push("/dashboard");
                    router.refresh();
                    return;
                }

                setCheckEmail(true);
                return;
            }

            const result = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (result.error) {
                setErrorMessage(mapAuthError(result.error));
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            setErrorMessage(mapAuthError(error));
        } finally {
            setLoading(false);
        }
    }

    if (checkEmail) {
        return (
            <div className="mx-auto w-full max-w-md border border-line bg-paper p-6 text-ink">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mute">
                    PortraitLab Studio
                </p>
                <h1 className="mt-3 font-display text-3xl tracking-[-0.01em]">
                    Check your email
                </h1>
                <p className="mt-4 text-sm leading-6 text-ink-soft">
                    We sent a confirmation link to <strong>{email}</strong>. Click it to
                    finish creating your account and sign in.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-md border border-line bg-paper p-6 text-ink">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mute">
                PortraitLab Studio
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-[-0.01em]">
                {mode === "sign-up" ? "Create account" : "Sign in"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
                {mode === "sign-up"
                    ? "Create an account to save your caricatures and access the studio."
                    : "Sign in to access your AI portrait studio and saved generations."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-soft">
                        Email
                    </label>

                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-ink"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-soft">
                        Password
                    </label>

                    <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-ink"
                        placeholder="Minimum 8 characters"
                    />
                </div>

                {errorMessage && (
                    <div className="border-t border-line pt-3 text-sm text-ink">
                        — {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper transition duration-300 ease-studio hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Processing…"
                        : mode === "sign-up"
                            ? "Create account"
                            : "Sign in"}
                </button>
            </form>
        </div>
    );
}
