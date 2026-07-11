import AgingPreview from "@/components/aging-legacy/AgingPreview";
import AgingAIStudio from "@/components/aging-ai/AgingAIStudio";
import { DashboardShell } from "@/components/DashboardShell";

export default function AgingPage() {
    return (
        <DashboardShell>
            <div className="space-y-8">
                <section className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-950 shadow-sm sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                            Studio workspace
                        </p>
                        <h1 className="mt-2 text-4xl font-black text-neutral-950 md:text-5xl">
                            AI Aging Studio
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                            Generate a realistic older version of the same person while
                            preserving identity, pose, clothing and background.
                        </p>
                    </div>

                    <AgingAIStudio />
                </section>

                <details className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                    <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-neutral-600">
                        Legacy local preview
                    </summary>
                    <div className="mt-5">
                        <AgingPreview />
                    </div>
                </details>
            </div>
        </DashboardShell>
    );
}
