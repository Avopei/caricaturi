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
        title: "Aging Preview",
        description:
            "Apply a browser-based artistic future-look simulation to an uploaded portrait.",
        href: "/dashboard/aging",
        icon: "AP",
        status: "soon" as const
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
        status: "soon" as const
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
            <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl shadow-slate-300/60">
                <div className="max-w-4xl">
                    <div className="mb-5 inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-200">
                        PortraitLab Studio
                    </div>

                    <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                        Choose a tool
                    </h1>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                        Upload a photo, generate a result, and review your image history.
                    </p>
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
