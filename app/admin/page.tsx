import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminDatasetChecklist } from "@/components/AdminDatasetChecklist";
import { AdminLoraDatasetExport } from "@/components/AdminLoraDatasetExport";

export default async function AdminPage() {
    const [
        profilesResult,
        generationsResult,
        lockedResult,
        unlockedResult,
        feedbackResult,
        waitlistResult,
        latestWaitlistResult,
        latestGenerationsResult,
        caricatureResult,
        agingResult,
        backgroundResult
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
            .select("id, tool, style, intensity, payment_status, feedback_rating, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("tool", "caricature"),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("tool", "aging"),
        supabaseAdmin
            .from("generations")
            .select("id", { count: "exact", head: true })
            .eq("tool", "background")
    ]);

    const stats = [
        { label: "Total users", value: profilesResult.count || 0 },
        { label: "Total generations", value: generationsResult.count || 0 },
        { label: "Locked previews", value: lockedResult.count || 0 },
        { label: "Unlocked generations", value: unlockedResult.count || 0 },
        { label: "Feedback received", value: feedbackResult.count || 0 },
        { label: "Pro waitlist", value: waitlistResult.count || 0 }
    ];

    const byTool = [
        { label: "Caricature", value: caricatureResult.count || 0 },
        { label: "Aging", value: agingResult.count || 0 },
        { label: "Background", value: backgroundResult.count || 0 }
    ];

    return (
        <div>
            <section className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.label} className="bg-paper p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
                            {item.label}
                        </p>
                        <p className="mt-3 font-display text-4xl tracking-[-0.01em]">
                            {item.value}
                        </p>
                    </div>
                ))}
            </section>

            <section className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
                {byTool.map((item) => (
                    <div key={item.label} className="bg-paper p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
                            Generations — {item.label}
                        </p>
                        <p className="mt-3 font-display text-3xl tracking-[-0.01em]">
                            {item.value}
                        </p>
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="border border-line bg-paper p-6">
                    <h2 className="font-display text-xl tracking-[-0.01em]">
                        Latest Pro waitlist
                    </h2>

                    <div className="mt-5 space-y-3">
                        {(latestWaitlistResult.data || []).length === 0 ? (
                            <p className="text-sm text-mute">No waitlist entries yet.</p>
                        ) : (
                            (latestWaitlistResult.data || []).map((item) => (
                                <div
                                    key={`${item.email}-${item.created_at}`}
                                    className="border border-line bg-surface p-4"
                                >
                                    <p className="font-semibold">{item.email}</p>
                                    <p className="mt-1 text-xs text-mute">
                                        {new Date(item.created_at).toLocaleString("en-US")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="border border-line bg-paper p-6">
                    <h2 className="font-display text-xl tracking-[-0.01em]">
                        Latest generations
                    </h2>

                    <div className="mt-5 space-y-3">
                        {(latestGenerationsResult.data || []).length === 0 ? (
                            <p className="text-sm text-mute">No generations yet.</p>
                        ) : (
                            (latestGenerationsResult.data || []).map((item) => (
                                <div key={item.id} className="border border-line bg-surface p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold">
                                            {item.tool} — {item.style || "—"}
                                        </p>

                                        <span className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                                            {item.payment_status}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-ink-soft">
                                        Intensity: {item.intensity || "—"}
                                    </p>

                                    <p className="mt-1 text-sm text-ink-soft">
                                        Feedback: {item.feedback_rating || "none"}
                                    </p>

                                    <p className="mt-1 text-xs text-mute">
                                        {new Date(item.created_at).toLocaleString("en-US")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <div className="mt-8">
                <AdminDatasetChecklist />
            </div>
            <div className="mt-8">
                <AdminLoraDatasetExport />
            </div>
        </div>
    );
}
