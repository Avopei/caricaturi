import Link from "next/link";
import type { ReactNode } from "react";

type StudioButtonProps = {
    href?: string;
    children: ReactNode;
    variant?: "solid" | "ghost";
    size?: "sm" | "md";
    arrow?: boolean;
    className?: string;
};

const variants = {
    solid: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
    ghost: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper"
};

const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm"
};

export function StudioButton({
                                 href,
                                 children,
                                 variant = "solid",
                                 size = "md",
                                 arrow = false,
                                 className = ""
                             }: StudioButtonProps) {
    const classes = `group inline-flex items-center justify-center gap-2 border font-semibold uppercase tracking-[0.08em] transition duration-300 ease-studio focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
        <>
            <span>{children}</span>
            {arrow && (
                <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 ease-studio group-hover:translate-x-1"
                >
                    →
                </span>
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {content}
            </Link>
        );
    }

    return <span className={classes}>{content}</span>;
}
