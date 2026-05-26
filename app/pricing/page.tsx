import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Demo access for testing the main image workflows.",
        features: [
            "Free preview flow",
            "Standard output quality",
            "Watermarked preview",
            "Basic caricature styles",
            "Generation history"
        ],
        cta: "Start for free",
        href: "/auth/sign-up",
        highlighted: false
    },
    {
        name: "Pro",
        price: "Planned",
        description:
            "A planned plan structure for unlocked downloads and more generation control.",
        features: [
            "More generations",
            "Unlocked image downloads",
            "Additional style controls",
            "Regenerate with variations",
            "Higher-quality export options",
            "Feedback-assisted iteration"
        ],
        cta: "View account",
        href: "/dashboard/account",
        highlighted: true
    },
    {
        name: "Admin / Internal",
        price: "Internal",
        description:
            "Admin-only review tools for data checks, feedback review, and quality notes.",
        features: [
            "Admin Review",
            "Dataset review",
            "Quality notes",
            "User and generation overview",
            "Feedback review",
            "Internal export workflow"
        ],
        cta: "Open dashboard",
        href: "/dashboard",
        highlighted: false
    }
];

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
            <header className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="text-2xl font-black">
                    PortraitLab<span className="text-violet-400"> Studio</span>
                </Link>

                <nav className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                    >
                        Home
                    </Link>

                    <Link
                        href="/dashboard"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-slate-200"
                    >
                        Studio
                    </Link>
                </nav>
            </header>

            <section className="mx-auto max-w-7xl py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200">
                        Demo plan structure
                    </div>

                    <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                        Simple plans for an MVP studio.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-slate-400">
                        Payments are not connected in this portfolio build. This page shows
                        the planned Free, Pro, and internal admin structure.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={
                                plan.highlighted
                                    ? "rounded-[2rem] border border-violet-500/40 bg-violet-500/10 p-8 shadow-2xl shadow-violet-950/30"
                                    : "rounded-[2rem] border border-white/10 bg-white/[0.04] p-8"
                            }
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-black">{plan.name}</h2>
                                    <p className="mt-2 text-slate-400">{plan.description}</p>
                                </div>
                            </div>

                            <p className="mt-8 text-5xl font-black">{plan.price}</p>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-3 text-slate-300">
                                        <span className="text-emerald-300">-</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={
                                    plan.highlighted
                                        ? "mt-8 inline-flex w-full justify-center rounded-2xl bg-white px-6 py-4 font-black text-slate-950 hover:bg-slate-200"
                                        : "mt-8 inline-flex w-full justify-center rounded-2xl border border-white/10 px-6 py-4 font-black text-white hover:bg-white/10"
                                }
                            >
                                {plan.cta}
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
