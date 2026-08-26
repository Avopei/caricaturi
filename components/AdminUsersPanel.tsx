"use client";

import { useEffect, useState } from "react";
import type { UserPlan, UserRole } from "@/types/caricature";

type AdminUser = {
    id: string;
    email: string | null;
    plan: UserPlan;
    role: UserRole;
    is_blocked: boolean;
    free_generations_used: number;
    free_generations_limit: number | null;
    created_at: string;
};

export function AdminUsersPanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});

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

            const drafts: Record<string, string> = {};
            (data.users || []).forEach((user) => {
                drafts[user.id] =
                    user.free_generations_limit === null
                        ? ""
                        : String(user.free_generations_limit);
            });
            setLimitDrafts(drafts);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Could not load users."
            );
        } finally {
            setLoading(false);
        }
    }

    async function patchUser(
        userId: string,
        path: string,
        body: Record<string, unknown>,
        patch: Partial<AdminUser>
    ) {
        setErrorMessage("");

        try {
            const response = await fetch(`/api/admin/users/${userId}/${path}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data: {
                success?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Could not update ${path}.`);
            }

            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? { ...user, ...patch } : user
                )
            );
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : `Could not update ${path}.`
            );
        }
    }

    function updatePlan(userId: string, plan: UserPlan) {
        return patchUser(userId, "plan", { plan }, { plan });
    }

    function updateRole(userId: string, role: UserRole) {
        return patchUser(userId, "role", { role }, { role });
    }

    function toggleBlocked(user: AdminUser) {
        return patchUser(
            user.id,
            "block",
            { isBlocked: !user.is_blocked },
            { is_blocked: !user.is_blocked }
        );
    }

    async function saveLimit(userId: string) {
        const draft = limitDrafts[userId] ?? "";
        const limit = draft.trim() === "" ? null : Number(draft);

        if (limit !== null && (!Number.isInteger(limit) || limit < 0)) {
            setErrorMessage("Limit must be a non-negative whole number.");
            return;
        }

        await patchUser(
            userId,
            "limit",
            { limit },
            { free_generations_limit: limit }
        );
    }

    return (
        <section className="border border-line bg-paper p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="font-display text-2xl tracking-[-0.01em]">
                        User management
                    </h2>
                    <p className="mt-1 text-sm text-mute">
                        Change plan, role, generation limit, and block status without
                        opening Supabase.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    className="border border-line px-4 py-2 text-sm font-semibold transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                >
                    Refresh
                </button>
            </div>

            {errorMessage && (
                <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-mute">Loading users...</p>
            ) : users.length === 0 ? (
                <p className="mt-6 text-sm text-mute">No users found.</p>
            ) : (
                <div className="mt-6 overflow-x-auto border border-line">
                    <table className="w-full min-w-[900px] border-collapse text-[15px]">
                        <thead>
                            <tr className="bg-surface text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Used / limit</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-line align-top">
                                    <td className="px-4 py-4">
                                        <p className="font-semibold">
                                            {user.email || "No email saved"}
                                        </p>
                                        <p className="mt-1 text-xs text-mute">{user.id}</p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <select
                                            value={user.plan}
                                            onChange={(event) =>
                                                updatePlan(user.id, event.target.value as UserPlan)
                                            }
                                            className="border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                                        >
                                            <option value="free">free</option>
                                            <option value="pro">pro</option>
                                        </select>
                                    </td>

                                    <td className="px-4 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(event) =>
                                                updateRole(user.id, event.target.value as UserRole)
                                            }
                                            className="border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                                        >
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>{user.free_generations_used}</span>
                                            <span className="text-mute">/</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="plan default"
                                                value={limitDrafts[user.id] ?? ""}
                                                onChange={(event) =>
                                                    setLimitDrafts((current) => ({
                                                        ...current,
                                                        [user.id]: event.target.value
                                                    }))
                                                }
                                                className="w-24 border border-line bg-paper px-2 py-1 outline-none focus:border-ink"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => saveLimit(user.id)}
                                                className="border border-line px-2 py-1 text-xs font-semibold transition duration-300 ease-studio hover:border-ink hover:bg-ink hover:text-paper"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => toggleBlocked(user)}
                                            className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition duration-300 ease-studio ${
                                                user.is_blocked
                                                    ? "border-ink bg-ink text-paper hover:bg-paper hover:text-ink"
                                                    : "border-line hover:border-ink hover:bg-ink hover:text-paper"
                                            }`}
                                        >
                                            {user.is_blocked ? "Blocked" : "Active"}
                                        </button>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-ink-soft">
                                        {new Date(user.created_at).toLocaleDateString("en-US")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
