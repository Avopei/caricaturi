import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { ProWaitlistButton } from "@/components/ProWaitlistButton";

const planLabel: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    studio: "Studio"
};

export default async function AccountPage() {
    const user = await requireUser();
    const profile = await getProfile();

    const isAdmin = profile?.role === "admin";
    const plan = profile ? planLabel[profile.plan] ?? profile.plan : "Free";

    return (
        <DashboardShell email={user.email}>
            <section className="rounded-xl border border-neutral-300 bg-white p-8 shadow-sm">
                <div className="max-w-3xl">
                    <div className="mb-6 inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-black text-neutral-600">
                        User account
                    </div>

                    <h1 className="text-5xl font-black tracking-tight text-neutral-950 md:text-6xl">
                        Account settings
                    </h1>

                    <p className="mt-5 text-lg leading-8 text-neutral-600">
                        Manage your profile, plan, credits, and future billing details from
                        this page.
                    </p>

                    <div className="mt-8 grid gap-4">
                        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                            <p className="text-sm font-bold text-neutral-500">Email</p>
                            <p className="mt-2 text-lg font-black text-neutral-950">
                                {user.email}
                            </p>
                        </div>
                        <div className="mt-6">
                            <ProWaitlistButton />
                        </div>

                        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                            <p className="text-sm font-bold text-neutral-500">Current plan</p>
                            <p className="mt-2 text-lg font-black text-neutral-950">
                                {plan}
                                {isAdmin ? " — Admin (unlimited access)" : ""}
                            </p>
                        </div>

                        {!isAdmin && profile && profile.plan === "free" && (
                            <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                                <p className="text-sm font-bold text-neutral-500">
                                    Free generations used
                                </p>
                                <p className="mt-2 text-lg font-black text-neutral-950">
                                    {profile.freeGenerationsUsed}
                                    {profile.freeGenerationsLimit !== null
                                        ? ` / ${profile.freeGenerationsLimit}`
                                        : ""}
                                </p>
                            </div>
                        )}

                        {profile?.isBlocked && (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                                <p className="text-sm font-bold text-red-700">
                                    Your account has been blocked. Contact support if you
                                    believe this is a mistake.
                                </p>
                            </div>
                        )}

                        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                            <p className="text-sm font-bold text-neutral-500">
                                Payment status
                            </p>
                            <p className="mt-2 text-lg font-black text-neutral-950">
                                Real payments will be activated later.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardShell>
    );
}
