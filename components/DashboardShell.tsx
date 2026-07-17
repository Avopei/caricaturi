"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

type DashboardShellProps = {
    children: ReactNode;
    email?: string;
};

const dashboardLinks = [
    { href: "/dashboard", label: "Tools", description: "All tools" },
    { href: "/dashboard/caricature", label: "Caricature", description: "Hand-drawn previews" },
    { href: "/dashboard/aging", label: "AI Aging", description: "Age progression" },
    { href: "/dashboard/background", label: "Background", description: "Subject cutout" },
    { href: "/dashboard/avatar", label: "Avatar", description: "Coming soon" },
    { href: "/dashboard/batch", label: "Batch", description: "Coming soon" },
    { href: "/examples", label: "Examples", description: "Before and after" },
    { href: "/pricing", label: "Pricing", description: "Plans" },
    { href: "/admin", label: "Admin", description: "Internal review" },
    { href: "/dashboard/account", label: "Account", description: "Settings" }
];

const toolPaths = [
    "/dashboard/caricature",
    "/dashboard/aging",
    "/dashboard/background",
    "/dashboard/avatar",
    "/dashboard/batch"
];

function getToolTitle(pathname: string) {
    if (pathname === "/dashboard/caricature") return "Caricature Studio";
    if (pathname === "/dashboard/aging") return "AI Aging Studio";
    if (pathname === "/dashboard/background") return "Background Remover";
    if (pathname === "/dashboard/avatar") return "Avatar Studio";
    if (pathname === "/dashboard/batch") return "Batch Tools";
    if (pathname === "/dashboard/account") return "Account";
    return "Dashboard";
}

export function DashboardShell({ children }: DashboardShellProps) {
    const pathname = usePathname();
    const isToolWorkspace = toolPaths.some((path) => pathname.startsWith(path));
    const title = getToolTitle(pathname);

    if (isToolWorkspace) {
        return (
            <main className="min-h-screen bg-surface text-ink">
                <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                            >
                                Back to tools
                            </Link>

                            <div className="hidden sm:block">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
                                    Workspace
                                </p>
                                <h1 className="font-display text-lg tracking-[-0.01em] text-ink">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/pricing"
                                className="hidden border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper sm:inline-flex"
                            >
                                Pricing
                            </Link>

                            <SignOutButton />
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface text-ink">
            <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
                <aside className="hidden border border-line bg-paper p-5 lg:block">
                    <div className="mb-8">
                        <Link href="/" className="block">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mute">
                                Studio
                            </p>
                            <h1 className="mt-2 font-display text-2xl tracking-[-0.01em] text-ink">
                                PortraitLab Studio
                            </h1>
                        </Link>

                        <p className="mt-3 text-sm leading-6 text-ink-soft">
                            Choose a tool, process a photo, and review saved results.
                        </p>
                    </div>

                    <nav className="space-y-2">
                        {dashboardLinks.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block border px-4 py-3 transition duration-300 ease-studio ${
                                        isActive
                                            ? "border-ink bg-ink text-paper"
                                            : "border-line bg-paper text-ink-soft hover:border-ink hover:bg-ink hover:text-paper"
                                    }`}
                                >
                                    <span className="block text-sm font-semibold">
                                        {item.label}
                                    </span>
                                    <span
                                        className={`mt-1 block text-xs ${
                                            isActive ? "text-paper/60" : "text-mute"
                                        }`}
                                    >
                                        {item.description}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <section className="min-w-0">
                    <header className="mb-6 flex items-center justify-between gap-4 border border-line bg-paper p-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
                                Dashboard
                            </p>
                            <h2 className="mt-1 font-display text-xl tracking-[-0.01em] text-ink">
                                {title}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/pricing"
                                className="hidden border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper sm:inline-flex"
                            >
                                Pricing
                            </Link>

                            <SignOutButton />
                        </div>
                    </header>

                    <div>{children}</div>
                </section>
            </div>
        </main>
    );
}
