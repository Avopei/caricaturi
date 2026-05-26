import { intensityOptions, styleOptions } from "@/lib/constants";
import type {
    CaricatureIntensity,
    CaricatureStyle
} from "@/types/caricature";

type StyleSelectorProps = {
    style: CaricatureStyle;
    intensity: CaricatureIntensity;
    isPro: boolean;
    onStyleChange: (style: CaricatureStyle) => void;
    onIntensityChange: (intensity: CaricatureIntensity) => void;
};

export function StyleSelector({
                                  style,
                                  intensity,
                                  isPro,
                                  onStyleChange,
                                  onIntensityChange
                              }: StyleSelectorProps) {
    const mainStyles = styleOptions.filter((option) => !option.pro);
    const proStyles = styleOptions.filter((option) => option.pro);

    const selectedIntensity = intensityOptions.find(
        (option) => option.value === intensity
    );

    function renderStyleCard(option: (typeof styleOptions)[number]) {
        const locked = Boolean(option.pro && !isPro);
        const active = option.value === style;

        return (
            <button
                key={option.value}
                type="button"
                disabled={locked}
                onClick={() => onStyleChange(option.value)}
                className={
                    active
                        ? "rounded-2xl border border-violet-400 bg-violet-500/20 p-4 text-left"
                        : locked
                            ? "cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left opacity-50"
                            : "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-violet-500/60 hover:bg-white/[0.06]"
                }
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-bold text-white">{option.label}</p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                            {option.description}
                        </p>
                    </div>

                    {option.pro && (
                        <span className="shrink-0 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-200">
              Pro
            </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">2. Choose style</h2>

            <p className="mt-1 text-sm text-slate-400">
                Start with a realistic hand-drawn style, then adjust exaggeration.
            </p>

            <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300">Main styles</h3>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
            Included
          </span>
                </div>

                <div className="grid gap-3">
                    {mainStyles.map((option) => renderStyleCard(option))}
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300">Advanced styles</h3>

                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
            Pro
          </span>
                </div>

                <div className="grid gap-3">
                    {proStyles.map((option) => renderStyleCard(option))}
                </div>

                {!isPro && (
                    <p className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-100">
                        Advanced styles will be available in Pro.
                    </p>
                )}
            </div>

            <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-slate-300">
                    Exaggeration level
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                    {intensityOptions.map((option) => {
                        const active = option.value === intensity;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onIntensityChange(option.value)}
                                className={
                                    active
                                        ? "rounded-xl border border-violet-400 bg-violet-500/20 px-4 py-3 text-left"
                                        : "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left hover:border-violet-500/60 hover:bg-white/[0.06]"
                                }
                            >
                                <p className="font-bold text-white">{option.label}</p>
                            </button>
                        );
                    })}
                </div>

                {selectedIntensity && (
                    <p className="mt-2 text-sm text-slate-500">
                        {selectedIntensity.description}
                    </p>
                )}
            </div>
        </div>
    );
}