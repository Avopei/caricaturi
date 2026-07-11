import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminGenerationsReview } from "@/components/AdminGenerationsReview";
import { AdminLoraDatasetExport } from "@/components/AdminLoraDatasetExport";
import { AdminDatasetChecklist } from "@/components/AdminDatasetChecklist";

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

    if (!profile || profile.plan !== "admin") {
        redirect("/dashboard");
    }

    return user;
}

export default async function AdminPage() {
    const user = await requireAdmin();

    const [
        profilesResult,
        generationsResult,
        lockedResult,
        unlockedResult,
        feedbackResult,
        waitlistResult,
        latestWaitlistResult,
        latestGenerationsResult
    ] = await Promise.all([
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("generations").select("id", { count: "exact", head: true }),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("payment_status", "unpaid"),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("payment_status", "paid"),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .not("feedback_rating", "is", null),
        supabaseAdmin
            .from("pro_waitlist")
            .select("id", { count: "exact", head: true }),
        supabaseAdmin
            .from("pro_waitlist")
            .select("email, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
        supabaseAdmin
            .from("generations")
            .select("id, style, intensity, payment_status, feedback_rating, created_at")
            .order("created_at", { ascending: false })
            .limit(10)
    ]);

    const stats = [
        {
            label: "Total users",
            value: profilesResult.count || 0
        },
        {
            label: "Total generations",
            value: generationsResult.count || 0
        },
        {
            label: "Locked previews",
            value: lockedResult.count || 0
        },
        {
            label: "Unlocked generations",
            value: unlockedResult.count || 0
        },
        {
            label: "Feedback received",
            value: feedbackResult.count || 0
        },
        {
            label: "Pro waitlist",
            value: waitlistResult.count || 0
        }
    ];

    return (
        <main className="min-h-screen bg-stone-100 px-5 py-8 text-neutral-950">
            <header className="mx-auto flex max-w-7xl items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-neutral-500">Admin Review</p>
                    <h1 className="text-3xl font-black">Dataset review</h1>
                    <p className="mt-1 text-sm text-neutral-600">{user.email}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:border-black"
                    >
                        Studio
                    </Link>

                    <Link
                        href="/"
                        className="rounded-lg bg-black px-4 py-2 text-sm font-black text-white hover:bg-neutral-800"
                    >
                        Home
                    </Link>
                </div>
            </header>

            <section className="mx-auto mt-8 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm text-neutral-500">{item.label}</p>
                        <p className="mt-3 text-4xl font-black">{item.value}</p>
                    </div>
                ))}
            </section>

            <section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black">Latest Pro waitlist</h2>

                    <div className="mt-5 space-y-3">
                        {(latestWaitlistResult.data || []).length === 0 ? (
                            <p className="text-sm text-neutral-500">No waitlist entries yet.</p>
                        ) : (
                            (latestWaitlistResult.data || []).map((item) => (
                                <div
                                    key={`${item.email}-${item.created_at}`}
                                    className="rounded-lg border border-neutral-300 bg-neutral-50 p-4"
                                >
                                    <p className="font-bold">{item.email}</p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        {new Date(item.created_at).toLocaleString("en-US")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-black">Latest generations</h2>

                    <div className="mt-5 space-y-3">
                        {(latestGenerationsResult.data || []).length === 0 ? (
                            <p className="text-sm text-neutral-500">No generations yet.</p>
                        ) : (
                            (latestGenerationsResult.data || []).map((item) => (
                                <div key={item.id} className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-bold">{item.style}</p>

                                        <span
                                            className={
                                                item.payment_status === "paid"
                                                    ? "rounded-full border border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700"
                                                    : "rounded-full border border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700"
                                            }
                                        >
                      {item.payment_status}
                    </span>
                                    </div>

                                    <p className="mt-1 text-sm text-neutral-600">
                                        Intensity: {item.intensity}
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-600">
                                        Feedback: {item.feedback_rating || "none"}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        {new Date(item.created_at).toLocaleString("en-US")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <AdminUsersPanel />
            <AdminGenerationsReview />
            <AdminDatasetChecklist />
            <AdminLoraDatasetExport />
        </main>
    );
}
