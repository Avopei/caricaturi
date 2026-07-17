"use client";

import { useCallback, useRef, useState } from "react";

function PortraitGlyph({ bold }: { bold: boolean }) {
    return (
        <svg viewBox="0 0 200 250" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <path
                d="M100 30c28 0 46 22 46 52 0 24-10 44-24 56 34 12 58 38 66 74H12c8-36 32-62 66-74-14-12-24-32-24-56 0-30 18-52 46-52Z"
                fill="none"
                stroke="currentColor"
                strokeWidth={bold ? 3.2 : 1.2}
                strokeLinejoin="round"
            />
            {bold && (
                <>
                    <path
                        d="M78 96c6 10 16 16 22 16s16-6 22-16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                    />
                    <path
                        d="M70 78c4-6 10-9 14-8M130 78c-4-6-10-9-14-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                    />
                </>
            )}
        </svg>
    );
}

export function HeroCompareSlider() {
    const [position, setPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const updateFromClientX = useCallback((clientX: number) => {
        const node = containerRef.current;

        if (!node) {
            return;
        }

        const rect = node.getBoundingClientRect();
        const ratio = ((clientX - rect.left) / rect.width) * 100;

        setPosition(Math.min(95, Math.max(5, ratio)));
    }, []);

    return (
        <div>
            <div
                ref={containerRef}
                className="relative aspect-[4/5] w-full cursor-ew-resize select-none overflow-hidden bg-surface text-ink"
                onPointerDown={(event) => {
                    draggingRef.current = true;
                    updateFromClientX(event.clientX);
                }}
                onPointerMove={(event) => {
                    if (draggingRef.current) {
                        updateFromClientX(event.clientX);
                    }
                }}
                onPointerUp={() => {
                    draggingRef.current = false;
                }}
                onPointerLeave={() => {
                    draggingRef.current = false;
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center p-10">
                    <PortraitGlyph bold={false} />
                </div>

                <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${position}%` }}
                >
                    <div
                        className="flex h-full items-center justify-center p-10"
                        style={{ width: `${10000 / position}%` }}
                    >
                        <PortraitGlyph bold />
                    </div>
                </div>

                <div
                    className="absolute inset-y-0 w-px bg-ink"
                    style={{ left: `${position}%` }}
                />
                <div
                    className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-ink bg-paper text-xs"
                    style={{ left: `${position}%` }}
                >
                    ↔
                </div>

                <div className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">
                    After
                </div>
                <div className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">
                    Before
                </div>
            </div>

            <input
                type="range"
                min={5}
                max={95}
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
                aria-label="Compare before and after"
                className="mt-4 w-full cursor-ew-resize accent-ink"
            />
        </div>
    );
}
