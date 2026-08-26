import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StudioButton } from "@/components/ui/StudioButton";
import { getPlanLimits } from "@/lib/plan";

export default async function PricingPage() {
    const limits = await getPlanLimits();

    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Preview the core studio tools with watermarked output.",
            features: [
                `${limits.free} generations per month`,
                "Standard output quality",
                "Watermarked preview",
                "Core caricature styles",
                "Generation history"
            ],
            cta: "Start for free",
            href: "/auth/sign-up"
        },
        {
            name: "Pro",
            price: "Planned",
            description: "Full access with unlocked downloads and more control.",
            features: [
                limits.pro >= 999 ? "Unlimited generations" : `${limits.pro} generations per month`,
                "Unlocked image downloads",
                "Additional style controls",
                "Regenerate with variations",
                "Higher-quality export options",
                "Feedback-assisted iteration"
            ],
            cta: "View account",
            href: "/dashboard/account"
        }
    ];

    return (
        <main className="min-h-screen bg-paper text-ink">
            <header className="border-b border-line px-5 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <Link href="/" className="leading-none">
                        <span className="block font-display text-xl tracking-[-0.01em]">
                            PortraitLab
                        </span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mute">
                            Studio
                        </span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                        >
                            Home
                        </Link>

                        <StudioButton href="/dashboard" size="sm" arrow>
                            Studio
                        </StudioButton>
                    </nav>
                </div>
            </header>

            <section className="px-5 py-20">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <Eyebrow className="text-center">Pricing</Eyebrow>
                        <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-[-0.015em] md:text-6xl">
                            Simple plans for the studio.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-ink-soft">
                            Payments are not connected in this build yet — this page shows
                            the real Free and Pro structure the product will ship with.
                        </p>
                    </div>

                    <div className="mt-14 grid divide-y divide-line border border-line md:grid-cols-2 md:divide-x md:divide-y-0">
                        {plans.map((plan) => (
                            <article key={plan.name} className="group p-8 transition duration-300 ease-studio hover:bg-ink hover:text-paper">
                                <h2 className="font-display text-3xl tracking-[-0.01em]">
                                    {plan.name}
                                </h2>
                                <p className="mt-3 leading-7 text-ink-soft group-hover:text-paper/70">
                                    {plan.description}
                                </p>
                                <p className="mt-8 font-display text-5xl tracking-[-0.01em]">
                                    {plan.price}
                                </p>

                                <ul className="mt-8 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-3 text-sm text-ink-soft group-hover:text-paper/70">
                                            <span className="font-semibold">—</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    className="mt-8 inline-flex w-full justify-center border border-ink bg-ink px-6 py-4 text-sm font-semibold text-paper transition duration-300 ease-studio group-hover:border-paper group-hover:bg-paper group-hover:text-ink"
                                >
                                    {plan.cta}
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
