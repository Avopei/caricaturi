import Link from "next/link";

const examples = [
    {
        title: "Realistic hand-drawn caricature",
        description:
            "A subtle caricature style that preserves the original pose, expression, hairstyle, clothes, and identity.",
        before: "/examples/before-1.jpg",
        after: "/examples/after-1.jpg"
    },
    {
        title: "Classic line caricature",
        description:
            "A traditional pencil-and-ink drawing with controlled exaggeration and natural hand-drawn linework.",
        before: "/examples/before-2.jpg",
        after: "/examples/after-2.jpg"
    },
    {
        title: "Black and white sketch",
        description:
            "A clean sketchbook-style portrait with visible pencil strokes, soft shading, and a simple paper background.",
        before: "/examples/before-3.jpg",
        after: "/examples/after-3.jpg"
    }
];

function ExampleImage({
                          label,
                          src,
                          fallback
                      }: {
    label: string;
    src: string;
    fallback: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-slate-300">
                {label}
            </div>

            <div className="flex aspect-square items-center justify-center bg-white/[0.03]">
                <img
                    src={src}
                    alt={label}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const parent = event.currentTarget.parentElement;

                        if (parent) {
                            parent.innerHTML = `
                <div style="padding: 24px; text-align: center; color: #94a3b8;">
                  <div style="font-size: 40px; margin-bottom: 12px;">${fallback}</div>
                  <div>Add an image to public/examples</div>
                </div>
              `;
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default function ExamplesPage() {
    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
            <header className="mx-auto flex max-w-6xl items-center justify-between">
                <Link href="/" className="text-lg font-black">
                    Caricature<span className="text-violet-400">AI</span>
                </Link>

                <nav className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                    >
                        Home
                    </Link>

                    <Link
                        href="/dashboard/caricature"
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                        Open generator
                    </Link>
                </nav>
            </header>

            <section className="mx-auto max-w-6xl py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                        Before / After examples
                    </div>

                    <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                        See what your portrait can become.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-slate-400">
                        The main style is a realistic hand-drawn caricature: subtle
                        exaggeration, preserved identity, natural pencil-and-ink lines, and
                        a clean paper-like finish.
                    </p>
                </div>

                <div className="mt-14 space-y-8">
                    {examples.map((example) => (
                        <article
                            key={example.title}
                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                        >
                            <div className="mb-5">
                                <h2 className="text-2xl font-black">{example.title}</h2>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                    {example.description}
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <ExampleImage
                                    label="Before"
                                    src={example.before}
                                    fallback="📷"
                                />

                                <ExampleImage
                                    label="After"
                                    src={example.after}
                                    fallback="✍️"
                                />
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-14 rounded-3xl border border-violet-500/20 bg-violet-500/10 p-8 text-center">
                    <h2 className="text-3xl font-black">
                        Ready to create your own caricature?
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-slate-300">
                        Upload a clear portrait, choose a style, and generate a protected
                        preview in your studio.
                    </p>

                    <Link
                        href="/dashboard/caricature"
                        className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-slate-950 hover:bg-slate-200"
                    >
                        Try it now
                    </Link>
                </div>
            </section>
        </main>
    );
}