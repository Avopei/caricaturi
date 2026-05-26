import type { FaceControls } from "@/types/caricature";

type FaceControlsPanelProps = {
    value: FaceControls;
    isPro: boolean;
    onChange: (value: FaceControls) => void;
};

export function FaceControlsPanel({
                                      value,
                                      isPro,
                                      onChange
                                  }: FaceControlsPanelProps) {
    function updateField<Key extends keyof FaceControls>(
        key: Key,
        nextValue: FaceControls[Key]
    ) {
        if (!isPro) {
            return;
        }

        onChange({
            ...value,
            [key]: nextValue
        });
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Advanced face controls
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                        These controls are prepared for the future Pro LoRA model. They are
                        not used by the standard prompt-based generator.
                    </p>
                </div>

                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-200">
          Pro
        </span>
            </div>

            {!isPro && (
                <p className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-100">
                    Face controls will be available only in Pro when the trained LoRA
                    pipeline is connected.
                </p>
            )}

            {isPro && (
                <p className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm leading-6 text-yellow-100">
                    Coming soon: these settings are visible for Pro users, but they will
                    only affect results after the LoRA pipeline is connected.
                </p>
            )}

            <div className={isPro ? "mt-5 space-y-4" : "mt-5 space-y-4 opacity-50"}>
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                        Eyes
                    </label>

                    <select
                        disabled={!isPro}
                        value={value.eyes}
                        onChange={(event) =>
                            updateField("eyes", event.target.value as FaceControls["eyes"])
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed"
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_larger">Slightly larger</option>
                        <option value="more_expressive">More expressive</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                        Nose
                    </label>

                    <select
                        disabled={!isPro}
                        value={value.nose}
                        onChange={(event) =>
                            updateField("nose", event.target.value as FaceControls["nose"])
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed"
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_emphasized">Slightly emphasized</option>
                        <option value="more_emphasized">More emphasized</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                        Jawline
                    </label>

                    <select
                        disabled={!isPro}
                        value={value.jawline}
                        onChange={(event) =>
                            updateField(
                                "jawline",
                                event.target.value as FaceControls["jawline"]
                            )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed"
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_sharper">Slightly sharper</option>
                        <option value="more_defined">More defined</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                        Expression
                    </label>

                    <select
                        disabled={!isPro}
                        value={value.expression}
                        onChange={(event) =>
                            updateField(
                                "expression",
                                event.target.value as FaceControls["expression"]
                            )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed"
                    >
                        <option value="preserve">Preserve original expression</option>
                        <option value="slightly_more_confident">
                            Slightly more confident
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                        Head size
                    </label>

                    <select
                        disabled={!isPro}
                        value={value.headSize}
                        onChange={(event) =>
                            updateField(
                                "headSize",
                                event.target.value as FaceControls["headSize"]
                            )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500 disabled:cursor-not-allowed"
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_larger">Slightly larger</option>
                    </select>
                </div>
            </div>
        </div>
    );
}