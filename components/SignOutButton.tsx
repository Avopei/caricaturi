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
            className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
        >
            Sign out
        </button>
    );
}
