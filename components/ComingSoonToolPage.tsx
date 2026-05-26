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
        <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl shadow-slate-300/60">
            <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-200">
                    <span>{icon}</span>
                    <span>{badge}</span>
                </div>

                <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                    {title}
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                    {description}
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                    {features.map((feature) => (
                        <div
                            key={feature}
                            className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 text-sm font-black">
                                {icon}
                            </div>

                            <p className="font-bold text-white">{feature}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/dashboard/caricature"
                        className="rounded-2xl bg-white px-6 py-4 text-center font-black text-black hover:bg-slate-200"
                    >
                        Use Caricature Studio
                    </Link>

                    <Link
                        href="/dashboard"
                        className="rounded-2xl border border-white/10 px-6 py-4 text-center font-black text-white hover:bg-white/10"
                    >
                        Back to Studio
                    </Link>
                </div>
            </div>
        </section>
    );
}
