import type { ReactNode } from "react";
import { getProfile } from "@/lib/profile";
import { DashboardChrome, type DashboardNavLink } from "@/components/DashboardChrome";

type DashboardShellProps = {
    children: ReactNode;
    email?: string;
};

function buildLinks(isAdmin: boolean): DashboardNavLink[] {
    const links: DashboardNavLink[] = [
        { href: "/dashboard", label: "Tools", description: "All tools" },
        { href: "/dashboard/caricature", label: "Caricature", description: "Hand-drawn previews" },
        { href: "/dashboard/aging", label: "AI Aging", description: "Age progression" },
        { href: "/dashboard/background", label: "Background", description: "Subject cutout" },
        { href: "/dashboard/avatar", label: "Avatar", description: "Coming soon" },
        { href: "/dashboard/batch", label: "Batch", description: "Coming soon" },
        { href: "/examples", label: "Examples", description: "Before and after" },
        { href: "/pricing", label: "Pricing", description: "Plans" }
    ];

    if (isAdmin) {
        links.push({ href: "/admin", label: "Admin", description: "Internal review" });
    }

    links.push({ href: "/dashboard/account", label: "Account", description: "Settings" });

    return links;
}

export async function DashboardShell({ children }: DashboardShellProps) {
    const profile = await getProfile();
    const links = buildLinks(profile?.role === "admin");

    return <DashboardChrome links={links}>{children}</DashboardChrome>;
}
