import Link from "next/link";
import type { ReactNode } from "react";

type StudioButtonProps = {
    href?: string;
    children: ReactNode;
    variant?: "primary" | "secondary" | "light";
    className?: string;
};

const variants = {
    primary:
        "border-black bg-black text-white hover:bg-neutral-800 focus-visible:outline-black",
    secondary:
        "border-neutral-300 bg-white text-neutral-950 hover:border-black hover:bg-neutral-50 focus-visible:outline-black",
    light:
        "border-white bg-white text-black hover:bg-neutral-200 focus-visible:outline-white"
};

export function StudioButton({
                                 href,
                                 children,
                                 variant = "primary",
                                 className = ""
                             }: StudioButtonProps) {
    const classes = `inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return <span className={classes}>{children}</span>;
}
