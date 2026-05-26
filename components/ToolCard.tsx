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

    const badge =
        status === "active" ? "Active" : status === "pro" ? "Coming soon" : "Coming soon";

    return (
        <Link
            href={href}
            className={
                isActive
                    ? "group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
                    : "group rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            }
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-sm font-black text-violet-800">
                    {icon}
                </div>

                <span
                    className={
                        status === "active"
                            ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
                            : status === "pro"
                                ? "rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700"
                                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500"
                    }
                >
                    {badge}
                </span>
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-950">{title}</h3>

            <p className="mt-3 min-h-20 leading-7 text-slate-600">
                {description}
            </p>

            <div className="mt-6 font-black text-violet-700">
                {isActive ? "Open tool" : "Coming soon"}
            </div>
        </Link>
    );
}
