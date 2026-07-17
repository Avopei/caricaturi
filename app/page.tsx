import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeroCompareSlider } from "@/components/ui/HeroCompareSlider";
import { Reveal } from "@/components/ui/Reveal";
import { StudioButton } from "@/components/ui/StudioButton";
import { StudioImageFrame } from "@/components/ui/StudioImageFrame";
import { StudioSectionHeader } from "@/components/ui/StudioSectionHeader";
import { ToolSwatch } from "@/components/ui/ToolSwatch";
import { Viewfinder } from "@/components/ui/Viewfinder";
import { createClient } from "@/lib/supabase/server";

const tools = [
    {
        title: "Caricature Studio",
        description:
            "Create recognizable, hand-drawn caricature previews with controlled exaggeration.",
        href: "/dashboard/caricature",
        swatch: "caricature" as const,
        status: "active" as const
    },
    {
        title: "AI Aging Studio",
        description:
            "Generate realistic age progression portraits while preserving identity and composition.",
        href: "/dashboard/aging",
        swatch: "aging" as const,
        status: "active" as const
    },
    {
        title: "Background Remover",
        description:
            "Cut out subjects cleanly for profile, catalog, and studio edits.",
        href: "/dashboard/background",
        swatch: "background" as const,
        status: "active" as const
    },
    {
        title: "Avatar Studio",
        description:
            "Plan profile-ready avatar variants for social and professional use.",
        href: "/dashboard/avatar",
        swatch: "avatar" as const,
        status: "soon" as const
    },
    {
        title: "Style Review",
        description:
            "Review planned sketch and style options for future portrait workflows.",
        href: "/dashboard/styles",
        swatch: "sketch" as const,
        status: "soon" as const
    },
    {
        title: "Batch Tools",
        description:
            "Prepare multi-image workflows for repeatable portrait processing.",
        href: "/dashboard/batch",
        swatch: "batch" as const,
        status: "soon" as const
    }
];

const examples = [
    {
        title: "Portrait study 01",
        description: "A clean before/after frame for the caricature workflow."
    },
    {
        title: "Portrait study 02",
        description: "A clean before/after frame for the aging workflow."
    },
    {
        title: "Portrait study 03",
        description: "A clean before/after frame for the background workflow."
    }
];

const steps = [
    "Upload a portrait",
    "Choose a tool and generate",
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
        name: "Studio / Admin",
        price: "Internal",
        description: "Review, dataset, and quality control workflows."
    }
];

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    const startHref = user ? "/dashboard" : "/auth/sign-up";

    return (
        <main className="min-h-screen bg-paper text-ink">
            <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
                    <Link href="/" className="leading-none">
                        <span className="block font-display text-xl tracking-[-0.01em]">
                            PortraitLab
                        </span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mute">
                            Studio
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
                        <a href="#tools" className="hover:text-ink">
                            Tools
                        </a>
                        <a href="#examples" className="hover:text-ink">
                            Examples
                        </a>
                        <Link href="/pricing" className="hover:text-ink">
                            Pricing
                        </Link>
                        {!user && (
                            <Link href="/auth/sign-in" className="hover:text-ink">
                                Sign in
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <StudioButton href="/dashboard" size="sm" arrow>
                                    Open studio
                                </StudioButton>
                                <SignOutButton />
                            </>
                        ) : (
                            <StudioButton href="/auth/sign-up" size="sm" arrow>
                                Open studio
                            </StudioButton>
                        )}
                    </div>
                </div>
            </header>

            <section className="border-b border-line px-5 py-16 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.82fr]">
                    <div className="hero-rise">
                        <Eyebrow>A classic portrait studio powered by modern AI</Eyebrow>
                        <h1 className="mt-5 max-w-5xl font-display text-6xl leading-[1.02] tracking-[-0.015em] md:text-8xl">
                            Classic portrait tools, <em className="italic">reimagined</em>.
                        </h1>
                        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">
                            Generate caricatures, preview aging, remove backgrounds and
                            create avatar-style portraits from one calm, black-and-white
                            studio interface.
                        </p>
                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <StudioButton href={startHref} arrow>
                                Start creating
                            </StudioButton>
                            <StudioButton href="#examples" variant="ghost">
                                View examples
                            </StudioButton>
                        </div>
                        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">
                            Caricature — Aging — Background — Avatar — Batch
                        </p>
                    </div>

                    <div className="lg:pt-6">
                        <Viewfinder metadata="Preset : caricature — 4 : 5">
                            <HeroCompareSlider />
                        </Viewfinder>
                    </div>
                </div>
            </section>

            <section id="tools" className="px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <StudioSectionHeader
                        eyebrow="Tools"
                        title="One quiet workspace for portrait edits."
                        description="Each tool keeps the upload, controls, preview, download, and history flow close together."
                        layout="split"
                    />

                    <div className="mt-12 border-t border-line">
                        {tools.map((tool) => (
                            <Link
                                key={tool.title}
                                href={tool.href}
                                className="group flex items-center justify-between gap-6 border-b border-line px-2 py-6 transition duration-300 ease-studio hover:bg-ink hover:text-paper"
                            >
                                <div className="flex items-center gap-6">
                                    <ToolSwatch kind={tool.swatch} />
                                    <div>
                                        <h3 className="font-display text-2xl tracking-[-0.01em]">
                                            {tool.title}
                                        </h3>
                                        <p className="mt-1 max-w-xl text-sm leading-6 text-ink-soft group-hover:text-paper/70">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-mute group-hover:text-paper/70 sm:block">
                                        {tool.status === "active" ? "Active" : "Coming soon"}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="inline-block transition-transform duration-300 ease-studio group-hover:translate-x-1"
                                    >
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="examples" className="border-y border-line px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <StudioSectionHeader
                            eyebrow="Examples"
                            title="Before and after, treated like a contact sheet."
                            description="Neutral image frames keep attention on the portrait transformation."
                        />
                    </Reveal>

                    <Reveal className="mt-12">
                        <div className="grid gap-5 md:grid-cols-3">
                            {examples.map((example, index) => (
                                <article key={example.title}>
                                    <Viewfinder metadata={`Study : 0${index + 1} — 4 : 5`}>
                                        <div className="aspect-[4/5]">
                                            <StudioImageFrame />
                                        </div>
                                    </Viewfinder>
                                    <h3 className="mt-5 font-display text-2xl tracking-[-0.01em]">
                                        {example.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                                        {example.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <section id="how-it-works" className="bg-ink px-5 py-20 text-paper">
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <StudioSectionHeader
                            eyebrow="Process"
                            title={<span className="text-paper">How it works</span>}
                            align="center"
                        />
                    </Reveal>
                    <Reveal>
                        <div className="mt-12 grid gap-px border border-line-dark bg-line-dark md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div key={step} className="bg-ink p-8">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/50">
                                        0{index + 1}
                                    </p>
                                    <h3 className="mt-6 font-display text-3xl tracking-[-0.01em] text-paper">
                                        {step}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="border-b border-line px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1fr]">
                            <Viewfinder metadata="Studio control room — dashboard preview">
                                <div className="aspect-[4/3]">
                                    <StudioImageFrame />
                                </div>
                            </Viewfinder>
                            <div>
                                <Eyebrow>Workspace</Eyebrow>
                                <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.015em] md:text-5xl">
                                    Choose a portrait workflow.
                                </h2>
                                <p className="mt-6 max-w-lg text-lg leading-8 text-ink-soft">
                                    Upload a photo, generate a result, and review saved
                                    history from one calm black-and-white workspace.
                                </p>
                                <div className="mt-8">
                                    <StudioButton href={startHref} arrow>
                                        Open the dashboard
                                    </StudioButton>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <StudioSectionHeader
                            eyebrow="Pricing"
                            title="Simple plans for the studio."
                            description="The current build keeps payments planned while preserving the account, history, and admin structure."
                            layout="split"
                        />
                    </Reveal>
                    <Reveal>
                        <div className="mt-12 grid divide-y divide-line border border-line md:grid-cols-3 md:divide-x md:divide-y-0">
                            {plans.map((plan) => (
                                <Link
                                    key={plan.name}
                                    href="/pricing"
                                    className="group block p-8 transition duration-300 ease-studio hover:bg-ink hover:text-paper"
                                >
                                    <h3 className="font-display text-3xl tracking-[-0.01em]">
                                        {plan.name}
                                    </h3>
                                    <p className="mt-6 font-display text-4xl tracking-[-0.01em]">
                                        {plan.price}
                                    </p>
                                    <p className="mt-5 leading-7 text-ink-soft group-hover:text-paper/70">
                                        {plan.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <footer className="bg-ink px-5 pb-10 pt-16 text-paper">
                <div className="mx-auto max-w-7xl">
                    <p className="font-display text-6xl leading-none tracking-[-0.015em] md:text-8xl">
                        PortraitLab Studio
                    </p>
                    <div className="mt-10 flex flex-col justify-between gap-4 border-t border-line-dark pt-6 text-sm text-paper/60 md:flex-row">
                        <p>Copyright 2026 PortraitLab Studio.</p>
                        <div className="flex gap-6">
                            <Link href="/pricing" className="hover:text-paper">
                                Pricing
                            </Link>
                            <Link href="/auth/sign-in" className="hover:text-paper">
                                Sign in
                            </Link>
                            <Link href="/dashboard" className="hover:text-paper">
                                Studio
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
