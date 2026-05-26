import type { ProfilePlanInfo } from "@/types/caricature";

type PlanStatusCardProps = {
    planInfo: ProfilePlanInfo | null;
    loading: boolean;
};

export function PlanStatusCard({ planInfo, loading }: PlanStatusCardProps) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Loading plan...</p>
            </div>
        );
    }

    if (!planInfo) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="text-sm text-red-200">
                    Could not load your plan information.
                </p>
            </div>
        );
    }

    const isPro = planInfo.plan === "pro" || planInfo.plan === "admin";

    return (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-violet-100">
                        Current plan
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                        {isPro ? "Pro" : "Free"}
                    </p>
                </div>

                <span
                    className={
                        isPro
                            ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-200"
                    }
                >
          {isPro ? "HD active" : "Standard"}
        </span>
            </div>

            {isPro ? (
                <p className="mt-4 text-sm leading-6 text-slate-300">
                    You have access to multiple generations, HD quality, no watermark,
                    and the future Pro LoRA pipeline.
                </p>
            ) : (
                <>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                        Free generations remaining:
                    </p>

                    <p className="mt-2 text-2xl font-black text-yellow-200">
                        {planInfo.remainingFreeGenerations} /{" "}
                        {planInfo.freeGenerationLimit}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-bold text-white">
                            Upgrade to Pro — coming soon
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                            Pro will include HD quality, no watermark, more styles, more
                            regenerations, and a trained AI style pipeline.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}