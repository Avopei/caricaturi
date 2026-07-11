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
                className={`rounded-lg border p-4 text-left transition ${
                    active
                        ? "border-black bg-black text-white"
                        : locked
                            ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-500 opacity-60"
                            : "border-neutral-300 bg-white text-neutral-950 hover:border-black"
                }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-bold">{option.label}</p>

                        <p className={`mt-1 text-sm leading-6 ${active ? "text-neutral-300" : "text-neutral-600"}`}>
                            {option.description}
                        </p>
                    </div>

                    {option.pro && (
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${active ? "border-white/30 text-white" : "border-neutral-300 text-neutral-600"}`}>
                            Pro
                        </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-neutral-950">2. Choose style</h2>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
                Start with a realistic hand-drawn style, then adjust exaggeration.
            </p>

            <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-700">Main styles</h3>

                    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-600">
                        Included
                    </span>
                </div>

                <div className="grid gap-3">
                    {mainStyles.map((option) => renderStyleCard(option))}
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-700">Advanced styles</h3>

                    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-600">
                        Pro
                    </span>
                </div>

                <div className="grid gap-3">
                    {proStyles.map((option) => renderStyleCard(option))}
                </div>

                {!isPro && (
                    <p className="mt-3 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                        Advanced styles will be available in Pro.
                    </p>
                )}
            </div>

            <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-neutral-700">
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
                                className={`rounded-lg border px-4 py-3 text-left transition ${
                                    active
                                        ? "border-black bg-black text-white"
                                        : "border-neutral-300 bg-white text-neutral-950 hover:border-black"
                                }`}
                            >
                                <p className="font-bold">{option.label}</p>
                            </button>
                        );
                    })}
                </div>

                {selectedIntensity && (
                    <p className="mt-2 text-sm text-neutral-500">
                        {selectedIntensity.description}
                    </p>
                )}
            </div>
        </div>
    );
}
