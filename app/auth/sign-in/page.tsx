import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface px-4">
            <div className="w-full">
                <AuthForm mode="sign-in" />

                <p className="mt-6 text-center text-sm text-ink-soft">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="font-semibold text-ink underline">
                        Create account
                    </Link>
                </p>
            </div>
        </main>
    );
}
