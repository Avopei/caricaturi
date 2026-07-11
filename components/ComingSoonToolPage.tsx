import Link from "next/link";

type ComingSoonToolPageProps = {
    title: string;
    description: string;
    icon: string;
    features: string[];
    badge?: string;
};

export function ComingSoonToolPage({
                                       title,
                                       description,
                                       icon,
                                       features,
                                       badge = "Coming soon"
                                   }: ComingSoonToolPageProps) {
    return (
        <section className="rounded-xl border border-neutral-300 bg-white p-8 text-neutral-950 shadow-sm">
            <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
                <div>
                    <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-600">
                        <span>{icon}</span>
                        <span>{badge}</span>
                    </div>

                    <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
                        {title}
                    </h1>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
                        {description}
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/dashboard/caricature"
                            className="rounded-lg bg-black px-6 py-4 text-center font-black text-white hover:bg-neutral-800"
                        >
                            Use Caricature Studio
                        </Link>

                        <Link
                            href="/dashboard"
                            className="rounded-lg border border-neutral-300 px-6 py-4 text-center font-black text-neutral-950 hover:border-black"
                        >
                            Back to Studio
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                    <div className="mb-5 rounded-lg border border-neutral-300 bg-white p-5">
                        <p className="font-mono text-xs text-neutral-500">{icon}</p>
                        <p className="mt-3 text-3xl font-black">Planned workflow</p>
                    </div>
                    <div className="grid gap-3">
                        {features.map((feature) => (
                            <div
                                key={feature}
                                className="rounded-lg border border-neutral-300 bg-white p-4"
                            >
                                <p className="font-bold text-neutral-950">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
