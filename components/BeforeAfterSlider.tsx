"use client";

import { useState } from "react";

type BeforeAfterSliderProps = {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
};

export function BeforeAfterSlider({
                                      beforeImage,
                                      afterImage,
                                      beforeLabel = "Original",
                                      afterLabel = "Generated"
                                  }: BeforeAfterSliderProps) {
    const [position, setPosition] = useState(50);

    return (
        <div className="w-full">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white">
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="absolute inset-0 h-full w-full object-contain"
                />

                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        width: `${position}%`
                    }}
                >
                    <img
                        src={afterImage}
                        alt={afterLabel}
                        className="h-full w-full object-contain"
                        style={{
                            width: `${10000 / position}%`,
                            maxWidth: "none"
                        }}
                    />
                </div>

                <div
                    className="absolute top-0 h-full w-1 bg-white shadow-lg"
                    style={{
                        left: `${position}%`,
                        transform: "translateX(-50%)"
                    }}
                />

                <div
                    className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950 shadow-xl"
                    style={{
                        left: `${position}%`
                    }}
                >
                    ↔
                </div>

                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    {afterLabel}
                </div>

                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    {beforeLabel}
                </div>
            </div>

            <input
                type="range"
                min="5"
                max="95"
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
                className="mt-4 w-full cursor-pointer"
            />
        </div>
    );
}