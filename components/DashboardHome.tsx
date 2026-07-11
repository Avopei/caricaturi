import { ToolCard } from "@/components/ToolCard";

const tools = [
    {
        title: "Caricature Studio",
        description:
            "Create a hand-drawn caricature from a portrait with preview, feedback, and download flow.",
        href: "/dashboard/caricature",
        icon: "CS",
        status: "active" as const
    },
    {
        title: "AI Aging Studio",
        description:
            "Generate realistic age progression portraits while preserving identity and composition.",
        href: "/dashboard/aging",
        icon: "AI",
        status: "active" as const
    },
    {
        title: "Style Review",
        description:
            "Review planned style options for future portrait workflows.",
        href: "/dashboard/styles",
        icon: "SR",
        status: "soon" as const
    },
    {
        title: "Background Remover",
        description:
            "Remove the background from an uploaded image while keeping the subject unchanged.",
        href: "/dashboard/background",
        icon: "BR",
        status: "active" as const
    },
    {
        title: "Avatar Studio",
        description:
            "Plan profile-ready avatar variants for social and professional use.",
        href: "/dashboard/avatar",
        icon: "AS",
        status: "soon" as const
    },
    {
        title: "Batch Tools",
        description:
            "Prepare multi-image workflows for repeatable portrait processing.",
        href: "/dashboard/batch",
        icon: "BT",
        status: "pro" as const
    }
];

export function DashboardHome() {
    return (
        <div>
            <section className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm">
                <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="p-8 md:p-10">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                            Studio control room
                        </p>
                        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none tracking-tight text-neutral-950 md:text-7xl">
                            Choose a portrait workflow.
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
                            Upload a photo, generate a result, and review saved history
                            from one calm black-and-white workspace.
                        </p>
                    </div>
                    <div className="min-h-80 border-t border-neutral-200 bg-neutral-100 p-5 lg:border-l lg:border-t-0">
                        <div className="flex h-full items-end rounded-lg border border-neutral-300 bg-white p-6">
                            <div>
                                <p className="font-mono text-sm text-neutral-500">
                                    PORTRAIT INDEX
                                </p>
                                <p className="mt-3 text-3xl font-black text-neutral-950">
                                    Tools, previews, downloads.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                    <ToolCard
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        href={tool.href}
                        icon={tool.icon}
                        status={tool.status}
                    />
                ))}
            </section>
        </div>
    );
}
