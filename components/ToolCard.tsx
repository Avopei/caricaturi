import Link from "next/link";
import type { ToolStatus } from "@/types/caricature";
import { ToolSwatch, type ToolSwatchKind } from "@/components/ui/ToolSwatch";

type ToolCardProps = {
    title: string;
    description: string;
    href: string;
    icon: ToolSwatchKind;
    status: ToolStatus;
};

export function ToolCard({
                             title,
                             description,
                             href,
                             icon,
                             status
                         }: ToolCardProps) {
    const isActive = status === "active";
    const badge = isActive ? "Active" : status === "pro" ? "Studio plan" : "Coming soon";

    return (
        <Link
            href={href}
            className="group flex min-h-full flex-col overflow-hidden border border-line bg-paper text-ink transition duration-300 ease-studio hover:bg-ink hover:text-paper"
        >
            <div className="flex items-center justify-between border-b border-line p-6 group-hover:border-line-dark">
                <ToolSwatch kind={icon} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute group-hover:text-paper/60">
                    {badge}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl tracking-[-0.01em]">{title}</h3>
                <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft group-hover:text-paper/70">
                    {description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    <span>Open workspace</span>
                    <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 ease-studio group-hover:translate-x-1"
                    >
                        →
                    </span>
                </div>
            </div>
        </Link>
    );
}
