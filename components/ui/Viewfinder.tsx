import type { ReactNode } from "react";

type ViewfinderProps = {
    children: ReactNode;
    metadata?: string;
    tone?: "light" | "dark";
    className?: string;
};

const bracketSize = "h-4 w-4";

export function Viewfinder({
                                children,
                                metadata,
                                tone = "light",
                                className = ""
                            }: ViewfinderProps) {
    const borderColor = tone === "dark" ? "border-paper" : "border-ink";
    const frameColor = tone === "dark" ? "border-line-dark" : "border-line";
    const textColor = tone === "dark" ? "text-paper/60" : "text-mute";

    return (
        <div className={`relative border ${frameColor} ${className}`}>
            <span
                className={`pointer-events-none absolute -left-px -top-px ${bracketSize} border-l border-t ${borderColor}`}
            />
            <span
                className={`pointer-events-none absolute -right-px -top-px ${bracketSize} border-r border-t ${borderColor}`}
            />
            <span
                className={`pointer-events-none absolute -bottom-px -left-px ${bracketSize} border-b border-l ${borderColor}`}
            />
            <span
                className={`pointer-events-none absolute -bottom-px -right-px ${bracketSize} border-b border-r ${borderColor}`}
            />

            {children}

            {metadata && (
                <div className={`border-t ${frameColor} px-4 py-3`}>
                    <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${textColor}`}
                    >
                        {metadata}
                    </p>
                </div>
            )}
        </div>
    );
}
