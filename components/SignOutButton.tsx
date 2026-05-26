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
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
            Sign out
        </button>
    );
}