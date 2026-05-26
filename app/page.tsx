import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

const steps = [
    {
        title: "Upload your photo",
        description:
            "Choose a clear portrait photo with the face visible."
    },
    {
        title: "Choose a style",
        description:
            "Pick a realistic hand-drawn caricature or sketch style."
    },
    {
        title: "Generate a preview",
        description:
            "Get a protected preview with a controlled hand-drawn look."
    },
    {
        title: "Unlock the final image",
        description:
            "The clean final version can be unlocked later without watermark."
    }
];

const styles = [
    "Realistic hand-drawn",
    "Classic line caricature",
    "Black & white sketch",
    "Street caricature",
    "Classic color caricature",
    "Comic caricature"
];

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    return (
        <main className="min-h-screen bg-[#eef0ff] text-slate-950">
            <header className="sticky top-0 z-50 border-b border-black/10 bg-black text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
                    <Link href="/" className="text-2xl font-black tracking-tight">
                        PortraitLab<span className="text-violet-300"> Studio</span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
                        <a href="#examples" className="hover:text-violet-200">
                            Examples
                        </a>
                        <a href="#how-it-works" className="hover:text-violet-200">
                            How it works
                        </a>
                        <a href="#styles" className="hover:text-violet-200">
                            Styles
                        </a>
                        <Link href="/pricing" className="hover:text-violet-200">
                            Pricing
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-slate-200"
                                >
                                    Dashboard
                                </Link>

                                <SignOutButton />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/sign-in"
                                    className="hidden rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 sm:inline-flex"
                                >
                                    Sign in
                                </Link>

                                <Link
                                    href="/auth/sign-up"
                                    className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-slate-200"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <section className="px-5 py-20 md:py-28">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500">
                            <Link href="/" className="hover:text-slate-950">
                                Home
                            </Link>
                            <span>›</span>
                            <span>PortraitLab Studio</span>
                        </div>

                        <h1 className="max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
                            AI-assisted image tools for portraits
                        </h1>

                        <p className="mt-8 max-w-3xl text-xl leading-9 text-slate-700 md:text-2xl">
                            Create a hand-drawn caricature from a portrait, remove image
                            backgrounds, and test a browser-based aging preview.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Link
                                href="/dashboard/caricature"
                                className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-5 text-xl font-black text-white shadow-xl shadow-black/20 hover:bg-slate-800"
                            >
                                Open the studio
                                <span className="ml-3 text-3xl leading-none">→</span>
                            </Link>

                            {!user && (
                                <Link
                                    href="/auth/sign-up"
                                    className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-8 py-5 text-xl font-black text-slate-950 hover:bg-slate-100"
                                >
                                    Create account
                                </Link>
                            )}
                        </div>

                        <p className="mt-5 text-lg text-slate-500">
                            MVP portfolio project with a free preview flow and planned Pro
                            structure.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-8 top-1/2 z-20 hidden -translate-y-1/2 rounded-3xl border border-black/10 bg-white p-4 shadow-2xl md:block">
                            <div className="mb-3 text-sm font-black text-slate-700">
                                Portrait workflow
                            </div>

                            <div className="grid gap-2">
                                <div className="h-3 w-40 rounded-full bg-slate-200" />
                                <div className="h-3 w-32 rounded-full bg-slate-200" />
                                <div className="h-3 w-36 rounded-full bg-slate-200" />
                            </div>

                            <div className="mt-4 rounded-xl bg-black px-4 py-2 text-center text-sm font-black text-white">
                                Generate
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl shadow-slate-400/40">
                            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-sky-300 via-violet-200 to-pink-200">
                                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_22%),radial-gradient(circle_at_80%_30%,white_0,transparent_18%),radial-gradient(circle_at_40%_80%,white_0,transparent_20%)]" />

                                <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full border-8 border-black bg-white shadow-xl">
                                    <div className="text-center">
                                        <div className="text-7xl">✍️</div>
                                        <p className="mt-4 text-2xl font-black">
                                            Hand-drawn
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-500">
                                            subtle caricature style
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 rounded-2xl bg-black/90 px-5 py-3 text-sm font-black text-white">
                                    Protected preview
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="examples" className="bg-white px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-widest text-violet-600">
                            Examples
                        </p>

                        <h2 className="mt-3 text-5xl font-black tracking-tight">
                            Example outputs
                        </h2>

                        <p className="mt-5 text-xl leading-8 text-slate-600">
                            Before and after previews for the core image tools in this
                            portfolio project.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                            >
                                <div className="grid gap-4">
                                    <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-200">
                                        <div className="text-center text-slate-500">
                                            <div className="text-5xl">📷</div>
                                            <p className="mt-3 font-bold">Original photo</p>
                                        </div>
                                    </div>

                                    <div className="flex aspect-square items-center justify-center rounded-2xl bg-violet-100">
                                        <div className="text-center text-slate-700">
                                            <div className="text-5xl">✍️</div>
                                            <p className="mt-3 font-black">Hand-drawn result</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="mt-5 text-xl font-black">
                                    Portrait variation #{item}
                                </h3>

                                <p className="mt-2 leading-6 text-slate-600">
                                    Controlled caricature styling with a recognizable portrait
                                    structure and hand-drawn line quality.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="px-5 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-violet-700">
                            Simple process
                        </p>

                        <h2 className="mt-3 text-5xl font-black tracking-tight">
                            How it works
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-4">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm"
                            >
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-xl font-black text-white">
                                    {index + 1}
                                </div>

                                <h3 className="text-2xl font-black">{step.title}</h3>

                                <p className="mt-3 text-lg leading-8 text-slate-600">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="styles" className="bg-black px-5 py-20 text-white">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest text-violet-300">
                            Styles
                        </p>

                        <h2 className="mt-3 text-5xl font-black tracking-tight">
                            Built for focused portrait workflows.
                        </h2>

                        <p className="mt-5 text-xl leading-8 text-slate-300">
                            The caricature workflow is designed to keep the portrait
                            recognizable while applying a controlled hand-drawn interpretation.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {styles.map((style) => (
                            <div
                                key={style}
                                className="rounded-3xl border border-white/10 bg-white/5 p-6"
                            >
                                <p className="text-xl font-black">{style}</p>

                                <p className="mt-2 leading-6 text-slate-400">
                                    Prepared for recognizable portraits and natural hand-drawn
                                    line quality.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-20">
                <div className="mx-auto max-w-5xl rounded-[2rem] bg-black p-10 text-center text-white shadow-2xl shadow-slate-400/40">
                    <h2 className="text-5xl font-black tracking-tight">
                        Open PortraitLab Studio.
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-slate-300">
                        Upload a clear portrait, generate a preview, and review your
                        image history.
                    </p>

                    <Link
                        href="/dashboard/caricature"
                        className="mt-8 inline-flex rounded-2xl bg-white px-8 py-5 text-xl font-black text-black hover:bg-slate-200"
                    >
                        Open studio
                    </Link>
                </div>
            </section>

            <footer className="border-t border-black/10 px-5 py-8 text-center text-sm text-slate-500">
                PortraitLab Studio - MVP / personal portfolio project
            </footer>
        </main>
    );
}
