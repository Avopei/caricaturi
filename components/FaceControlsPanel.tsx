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

    const selectClass =
        "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-black disabled:cursor-not-allowed";

    return (
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-neutral-950">
                        Advanced face controls
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                        These controls are prepared for the future Pro LoRA model. They are
                        not used by the standard prompt-based generator.
                    </p>
                </div>

                <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-black text-neutral-600">
                    Pro
                </span>
            </div>

            {!isPro && (
                <p className="mt-4 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                    Face controls will be available only in Pro when the trained LoRA
                    pipeline is connected.
                </p>
            )}

            {isPro && (
                <p className="mt-4 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                    Coming soon: these settings are visible for Pro users, but they will
                    only affect results after the LoRA pipeline is connected.
                </p>
            )}

            <div className={isPro ? "mt-5 space-y-4" : "mt-5 space-y-4 opacity-50"}>
                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        Eyes
                    </label>
                    <select
                        disabled={!isPro}
                        value={value.eyes}
                        onChange={(event) =>
                            updateField("eyes", event.target.value as FaceControls["eyes"])
                        }
                        className={selectClass}
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_larger">Slightly larger</option>
                        <option value="more_expressive">More expressive</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        Nose
                    </label>
                    <select
                        disabled={!isPro}
                        value={value.nose}
                        onChange={(event) =>
                            updateField("nose", event.target.value as FaceControls["nose"])
                        }
                        className={selectClass}
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_emphasized">Slightly emphasized</option>
                        <option value="more_emphasized">More emphasized</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
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
                        className={selectClass}
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_sharper">Slightly sharper</option>
                        <option value="more_defined">More defined</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
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
                        className={selectClass}
                    >
                        <option value="preserve">Preserve original expression</option>
                        <option value="slightly_more_confident">
                            Slightly more confident
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
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
                        className={selectClass}
                    >
                        <option value="normal">Normal</option>
                        <option value="slightly_larger">Slightly larger</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
