import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

type StudioSectionHeaderProps = {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    align?: "left" | "center";
    layout?: "stacked" | "split";
};

export function StudioSectionHeader({
                                        eyebrow,
                                        title,
                                        description,
                                        align = "left",
                                        layout = "stacked"
                                    }: StudioSectionHeaderProps) {
    const heading = (
        <>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.015em] text-ink md:text-6xl">
                {title}
            </h2>
        </>
    );

    if (layout === "split") {
        return (
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">{heading}</div>
                {description && (
                    <p className="max-w-md text-base leading-[1.55] text-ink-soft md:text-right">
                        {description}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            {heading}
            {description && (
                <p className="mt-5 text-lg leading-[1.55] text-ink-soft">{description}</p>
            )}
        </div>
    );
}
