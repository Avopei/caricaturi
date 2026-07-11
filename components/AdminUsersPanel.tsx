"use client";

import { useEffect, useState } from "react";
import type { UserPlan } from "@/types/caricature";

type AdminUser = {
    id: string;
    email: string | null;
    plan: UserPlan;
    free_generations_used: number;
    created_at: string;
};

export function AdminUsersPanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/admin/users");
            const data: {
                users?: AdminUser[];
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load users.");
            }

            setUsers(data.users || []);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not load users."
            );
        } finally {
            setLoading(false);
        }
    }

    async function updatePlan(userId: string, plan: UserPlan) {
        setErrorMessage("");

        try {
            const response = await fetch(`/api/admin/users/${userId}/plan`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    plan
                })
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not update plan.");
            }

            setUsers((current) =>
                current.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            plan
                        }
                        : user
                )
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not update plan."
            );
        }
    }

    return (
        <section className="mx-auto mt-8 max-w-7xl rounded-xl border border-neutral-300 bg-white p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-black">User management</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                        Upgrade or downgrade users without opening Supabase.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-950 hover:bg-neutral-100"
                >
                    Refresh
                </button>
            </div>

            {errorMessage && (
                <div className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-neutral-500">Loading users...</p>
            ) : users.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">No users found.</p>
            ) : (
                <div className="mt-6 overflow-hidden rounded-lg border border-neutral-300">
                    <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] bg-neutral-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500">
                        <div>User</div>
                        <div>Plan</div>
                        <div>Free used</div>
                        <div>Change plan</div>
                    </div>

                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] items-center border-t border-neutral-300 px-4 py-4 text-sm"
                        >
                            <div>
                                <p className="font-bold text-neutral-950">
                                    {user.email || "No email saved"}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">{user.id}</p>
                            </div>

                            <div>
                <span
                    className={
                        user.plan === "admin"
                            ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                            : user.plan === "pro"
                                ? "rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700"
                                : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-200"
                    }
                >
                  {user.plan}
                </span>
                            </div>

                            <div className="text-neutral-700">{user.free_generations_used}</div>

                            <div>
                                <select
                                    value={user.plan}
                                    onChange={(event) =>
                                        updatePlan(user.id, event.target.value as UserPlan)
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-950 outline-none focus:border-black"
                                >
                                    <option value="free">free</option>
                                    <option value="pro">pro</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}