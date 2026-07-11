"use client";

import { agingPresets, type AgingPreset } from "@/lib/aging-ai/types";

type AgingPresetSelectorProps = {
    selectedPreset: AgingPreset;
    onPresetChange: (preset: AgingPreset) => void;
};

export function AgingPresetSelector({
                                        selectedPreset,
                                        onPresetChange
                                    }: AgingPresetSelectorProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {agingPresets.map((preset) => {
                const selected = selectedPreset === preset.id;

                return (
                    <label
                        key={preset.id}
                        className={`cursor-pointer rounded-lg border p-4 transition ${
                            selected
                                ? "border-black bg-black text-white"
                                : "border-neutral-300 bg-white text-neutral-950 hover:border-black"
                        }`}
                    >
                        <input
                            type="radio"
                            name="agePreset"
                            value={preset.id}
                            checked={selected}
                            onChange={() => onPresetChange(preset.id)}
                            className="sr-only"
                        />
                        <span className="block text-base font-black">
                            {preset.label}
                        </span>
                        <span
                            className={`mt-2 block text-sm leading-6 ${
                                selected ? "text-neutral-200" : "text-neutral-600"
                            }`}
                        >
                            {preset.description}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
