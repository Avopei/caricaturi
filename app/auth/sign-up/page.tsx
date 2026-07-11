import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignUpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
            <div className="w-full">
                <AuthForm mode="sign-up" />

                <p className="mt-6 text-center text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link href="/auth/sign-in" className="font-bold text-black underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
