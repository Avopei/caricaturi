import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { StudioButton } from "@/components/ui/StudioButton";
import { StudioImageFrame } from "@/components/ui/StudioImageFrame";
import { StudioSectionHeader } from "@/components/ui/StudioSectionHeader";
import { createClient } from "@/lib/supabase/server";

const tools = [
    {
        title: "AI Caricature Generator",
        description:
            "Create recognizable, hand-drawn caricature previews with controlled exaggeration.",
        href: "/dashboard/caricature",
        label: "Line portrait"
    },
    {
        title: "Aging Preview",
        description:
            "Apply an artistic future-look study directly in the browser.",
        href: "/dashboard/aging",
        label: "Time study"
    },
    {
        title: "Background Remover",
        description:
            "Cut out subjects cleanly for profile, catalog, and studio edits.",
        href: "/dashboard/background",
        label: "Clean edit"
    },
    {
        title: "Avatar Portraits",
        description:
            "Plan profile-ready portrait variants for social and professional use.",
        href: "/dashboard/avatar",
        label: "Avatar set"
    },
    {
        title: "Batch Studio",
        description:
            "Prepare repeatable portrait workflows for multiple images.",
        href: "/dashboard/batch",
        label: "Series work"
    }
];

const steps = [
    "Upload a portrait",
    "Choose a tool and style",
    "Generate or preview",
    "Download and manage history"
];

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Preview the core studio tools with watermarked output."
    },
    {
        name: "Pro",
        price: "Planned",
        description: "More generations, unlocked downloads, and advanced controls."
    },
    {
        name: "Studio/Admin",
        price: "Internal",
        description: "Review, dataset, and quality control workflows."
    }
];

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    return (
        <main className="min-h-screen bg-stone-100 text-neutral-950">
            <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
                    <Link href="/" className="text-xl font-black tracking-tight">
                        PortraitLab Studio
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-bold text-neutral-600 md:flex">
                        <a href="#tools" className="hover:text-black">
                            Tools
                        </a>
                        <a href="#examples" className="hover:text-black">
                            Examples
                        </a>
                        <Link href="/pricing" className="hover:text-black">
                            Pricing
                        </Link>
                        {!user && (
                            <Link href="/auth/sign-in" className="hover:text-black">
                                Sign in
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <StudioButton href="/dashboard">Open Studio</StudioButton>
                                <SignOutButton />
                            </>
                        ) : (
                            <StudioButton href="/auth/sign-up">Open Studio</StudioButton>
                        )}
                    </div>
                </div>
            </header>

            <section className="border-b border-neutral-200 bg-white px-5 py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.82fr]">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.32em] text-neutral-500">
                            A classic portrait studio powered by modern AI.
                        </p>
                        <h1 className="mt-5 max-w-5xl text-6xl font-black leading-[0.92] tracking-tight md:text-8xl">
                            Classic portrait tools, powered by AI.
                        </h1>
                        <p className="mt-8 max-w-3xl text-xl leading-9 text-neutral-600">
                            Generate caricatures, preview aging, remove backgrounds and
                            create avatar-style portraits from one clean studio interface.
                        </p>
                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <StudioButton href={user ? "/dashboard" : "/auth/sign-up"} className="px-7 py-4 text-base">
                                Start creating
                            </StudioButton>
                            <StudioButton href="#examples" variant="secondary" className="px-7 py-4 text-base">
                                View examples
                            </StudioButton>
                        </div>
                    </div>

                    <div className="lg:pt-10">
                        <StudioImageFrame
                            eyebrow="Editorial preview"
                            label="Portrait to caricature study"
                        />
                    </div>
                </div>
            </section>

            <section id="tools" className="px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <StudioSectionHeader
                        eyebrow="Tools"
                        title="One quiet workspace for portrait edits."
                        description="Each tool keeps the upload, controls, preview, download, and history flow close together."
                    />

                    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                        {tools.map((tool, index) => (
                            <Link
                                key={tool.title}
                                href={tool.href}
                                className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-xl"
                            >
                                <div className="aspect-[4/3] border-b border-neutral-200 bg-neutral-100 p-4">
                                    <div className="flex h-full items-end rounded-lg border border-neutral-300 bg-white p-4">
                                        <div>
                                            <p className="font-mono text-xs text-neutral-500">
                                                0{index + 1}
                                            </p>
                                            <p className="mt-2 text-xl font-black">
                                                {tool.label}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="text-xl font-black">{tool.title}</h3>
                                    <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">
                                        {tool.description}
                                    </p>
                                    <p className="mt-5 text-sm font-black text-neutral-950">
                                        Open tool
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="examples" className="border-y border-neutral-200 bg-white px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <StudioSectionHeader
                        eyebrow="Examples"
                        title="Before and after, treated like a contact sheet."
                        description="Neutral image frames keep attention on the portrait transformation."
                    />

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <article
                                key={item}
                                className="rounded-xl border border-neutral-300 bg-neutral-50 p-4"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="aspect-[3/4] rounded-lg border border-neutral-300 bg-white p-4">
                                        <div className="h-full rounded-t-full bg-neutral-200" />
                                    </div>
                                    <div className="aspect-[3/4] rounded-lg border border-neutral-950 bg-neutral-950 p-4">
                                        <div className="h-full rounded-t-full bg-white" />
                                    </div>
                                </div>
                                <h3 className="mt-5 text-xl font-black">
                                    Portrait study #{item}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-neutral-600">
                                    A clean before/after frame for caricature, aging, and
                                    background workflows.
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <StudioSectionHeader
                        eyebrow="Process"
                        title="How it works"
                        align="center"
                    />
                    <div className="mt-12 grid gap-4 md:grid-cols-4">
                        {steps.map((step, index) => (
                            <div
                                key={step}
                                className="rounded-xl border border-neutral-300 bg-white p-6"
                            >
                                <p className="font-mono text-sm text-neutral-500">
                                    0{index + 1}
                                </p>
                                <h3 className="mt-6 text-2xl font-black">{step}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-neutral-200 bg-white px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <StudioSectionHeader
                        eyebrow="Pricing"
                        title="Simple plans for the studio."
                        description="The current build keeps payments planned while preserving the account, history, and admin structure."
                    />
                    <div className="mt-12 grid gap-5 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <article
                                key={plan.name}
                                className="rounded-xl border border-neutral-300 bg-white p-7 shadow-sm"
                            >
                                <h3 className="text-3xl font-black">{plan.name}</h3>
                                <p className="mt-6 text-4xl font-black">{plan.price}</p>
                                <p className="mt-5 leading-7 text-neutral-600">
                                    {plan.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16">
                <div className="mx-auto max-w-7xl rounded-xl bg-black px-8 py-12 text-white md:px-12">
                    <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                                Open PortraitLab Studio.
                            </h2>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">
                                Create expressive portraits, clean edits and artistic
                                transformations.
                            </p>
                        </div>
                        <StudioButton href="/dashboard" variant="light" className="px-7 py-4 text-base">
                            Go to dashboard
                        </StudioButton>
                    </div>
                </div>
            </section>

            <footer className="border-t border-neutral-200 bg-white px-5 py-8">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-neutral-600 md:flex-row">
                    <p className="font-black text-neutral-950">PortraitLab Studio</p>
                    <div className="flex gap-5">
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/auth/sign-in">Sign in</Link>
                        <Link href="/dashboard">Studio</Link>
                    </div>
                    <p>Copyright 2026 PortraitLab Studio.</p>
                </div>
            </footer>
        </main>
    );
}
