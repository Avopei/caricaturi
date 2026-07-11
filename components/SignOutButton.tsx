"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
    const router = useRouter();

    async function handleSignOut() {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.push("/auth/sign-in");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black hover:bg-neutral-50"
        >
            Sign out
        </button>
    );
}
