import { ToolCard } from "@/components/ToolCard";

const tools = [
    {
        title: "Caricature Studio",
        description:
            "Create a hand-drawn caricature from a portrait with preview, feedback, and download flow.",
        href: "/dashboard/caricature",
        icon: "caricature" as const,
        status: "active" as const
    },
    {
        title: "AI Aging Studio",
        description:
            "Generate realistic age progression portraits while preserving identity and composition.",
        href: "/dashboard/aging",
        icon: "aging" as const,
        status: "active" as const
    },
    {
        title: "Style Review",
        description:
            "Review planned style options for future portrait workflows.",
        href: "/dashboard/styles",
        icon: "sketch" as const,
        status: "soon" as const
    },
    {
        title: "Background Remover",
        description:
            "Remove the background from an uploaded image while keeping the subject unchanged.",
        href: "/dashboard/background",
        icon: "background" as const,
        status: "active" as const
    },
    {
        title: "Avatar Studio",
        description:
            "Plan profile-ready avatar variants for social and professional use.",
        href: "/dashboard/avatar",
        icon: "avatar" as const,
        status: "soon" as const
    },
    {
        title: "Batch Tools",
        description:
            "Prepare multi-image workflows for repeatable portrait processing.",
        href: "/dashboard/batch",
        icon: "batch" as const,
        status: "pro" as const
    }
];

export function DashboardHome() {
    return (
        <div>
            <section className="overflow-hidden border border-line bg-paper">
                <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="p-8 md:p-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
                            Studio control room
                        </p>
                        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] tracking-[-0.015em] md:text-7xl">
                            Choose a portrait workflow.
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-soft">
                            Upload a photo, generate a result, and review saved history
                            from one calm black-and-white workspace.
                        </p>
                    </div>
                    <div className="min-h-80 border-t border-line bg-surface p-5 lg:border-l lg:border-t-0">
                        <div className="flex h-full items-end border border-line bg-paper p-6">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">
                                    Portrait index
                                </p>
                                <p className="mt-3 font-display text-3xl tracking-[-0.01em]">
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
