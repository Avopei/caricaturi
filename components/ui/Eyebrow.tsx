import type { ReactNode } from "react";

type EyebrowProps = {
    children: ReactNode;
    className?: string;
    as?: "p" | "span";
};

export function Eyebrow({ children, className = "", as = "p" }: EyebrowProps) {
    const Tag = as;

    return (
        <Tag
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] text-mute ${className}`}
        >
            {children}
        </Tag>
    );
}
