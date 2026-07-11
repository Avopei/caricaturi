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
        <main className="min-h-screen bg-stone-100 px-5 py-8 text-neutral-950">
            <header className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="text-2xl font-black">
                    PortraitLab Studio
                </Link>

                <nav className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-black"
                    >
                        Home
                    </Link>

                    <Link
                        href="/dashboard"
                        className="rounded-lg bg-black px-4 py-2 text-sm font-black text-white hover:bg-neutral-800"
                    >
                        Studio
                    </Link>
                </nav>
            </header>

            <section className="mx-auto max-w-7xl py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-600">
                        Demo plan structure
                    </div>

                    <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                        Simple plans for a portrait studio.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-neutral-600">
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
                                    ? "rounded-xl border border-black bg-white p-8 shadow-xl"
                                    : "rounded-xl border border-neutral-300 bg-white p-8 shadow-sm"
                            }
                        >
                            <h2 className="text-3xl font-black">{plan.name}</h2>
                            <p className="mt-2 leading-7 text-neutral-600">{plan.description}</p>
                            <p className="mt-8 text-5xl font-black">{plan.price}</p>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-3 text-neutral-700">
                                        <span className="font-black">-</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={
                                    plan.highlighted
                                        ? "mt-8 inline-flex w-full justify-center rounded-lg bg-black px-6 py-4 font-black text-white hover:bg-neutral-800"
                                        : "mt-8 inline-flex w-full justify-center rounded-lg border border-neutral-300 px-6 py-4 font-black text-neutral-950 hover:border-black"
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
