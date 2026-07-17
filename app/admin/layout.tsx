import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdminUser } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const admin = await requireAdminUser();

    return (
        <main className="min-h-screen bg-surface px-5 py-8 text-ink">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
                            Admin
                        </p>
                        <h1 className="mt-1 font-display text-3xl tracking-[-0.01em]">
                            Admin Portal
                        </h1>
                        <p className="mt-1 text-sm text-ink-soft">{admin.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                        >
                            Studio
                        </Link>

                        <Link
                            href="/"
                            className="border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper transition duration-300 ease-studio hover:bg-paper hover:text-ink"
                        >
                            Home
                        </Link>
                    </div>
                </header>

                <AdminNav />

                <div className="mt-8">{children}</div>
            </div>
        </main>
    );
}
