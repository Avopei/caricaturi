import type { ProfilePlanInfo } from "@/types/caricature";

type PlanStatusCardProps = {
    planInfo: ProfilePlanInfo | null;
    loading: boolean;
};

export function PlanStatusCard({ planInfo, loading }: PlanStatusCardProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                <p className="text-sm text-neutral-500">Loading plan...</p>
            </div>
        );
    }

    if (!planInfo) {
        return (
            <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                <p className="text-sm text-red-700">
                    Could not load your plan information.
                </p>
            </div>
        );
    }

    const isPro = planInfo.plan !== "free";

    return (
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-neutral-600">
                        Current plan
                    </p>

                    <p className="mt-2 text-3xl font-black text-neutral-950">
                        {isPro ? "Pro" : "Free"}
                    </p>
                </div>

                <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-black text-neutral-700">
                    {isPro ? "HD active" : "Standard"}
                </span>
            </div>

            {isPro ? (
                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    You have access to multiple generations, HD quality, no watermark,
                    and the future Pro LoRA pipeline.
                </p>
            ) : (
                <>
                    <p className="mt-4 text-sm leading-6 text-neutral-600">
                        Free generations remaining:
                    </p>

                    <p className="mt-2 text-2xl font-black text-neutral-950">
                        {planInfo.remainingFreeGenerations} /{" "}
                        {planInfo.freeGenerationLimit}
                    </p>

                    <div className="mt-4 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                        <p className="text-sm font-bold text-neutral-950">
                            Upgrade to Pro - coming soon
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                            Pro will include HD quality, no watermark, more styles, more
                            regenerations, and a trained AI style pipeline.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
