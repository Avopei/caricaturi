"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/generations", label: "Generations" },
    { href: "/admin/settings", label: "Settings" }
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-2 border-b border-line pb-4">
            {links.map((link) => {
                const isActive =
                    link.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(link.href);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`border px-4 py-2 text-sm font-semibold transition duration-300 ease-studio ${
                            isActive
                                ? "border-ink bg-ink text-paper"
                                : "border-line bg-paper text-ink-soft hover:border-ink hover:bg-ink hover:text-paper"
                        }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
