import Link from "next/link";
import type { ToolStatus } from "@/types/caricature";

type ToolCardProps = {
    title: string;
    description: string;
    href: string;
    icon: string;
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
    const badge = isActive ? "Active" : status === "pro" ? "Studio plan" : "Available";

    return (
        <Link
            href={href}
            className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-xl"
        >
            <div className="aspect-[16/10] border-b border-neutral-200 bg-neutral-100 p-4">
                <div className="flex h-full items-end justify-between rounded-lg border border-neutral-300 bg-white p-4">
                    <div>
                        <p className="font-mono text-xs text-neutral-500">{icon}</p>
                        <p className="mt-2 max-w-44 text-2xl font-black leading-7 text-neutral-950">
                            {title}
                        </p>
                    </div>
                    <div className="h-20 w-14 rounded-t-full bg-neutral-950 transition group-hover:h-24" />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-neutral-600">
                        {badge}
                    </span>
                </div>

                <p className="mt-5 flex-1 leading-7 text-neutral-600">{description}</p>

                <div className="mt-6 inline-flex font-black text-black">
                    Open workspace
                </div>
            </div>
        </Link>
    );
}
