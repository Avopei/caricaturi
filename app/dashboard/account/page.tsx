import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { ProWaitlistButton } from "@/components/ProWaitlistButton";
export default async function AccountPage() {
    const user = await requireUser();

    return (
        <DashboardShell email={user.email}>
            <section className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-300/60">
                <div className="max-w-3xl">
                    <div className="mb-6 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
                        User account
                    </div>

                    <h1 className="text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
                        Account settings
                    </h1>

                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Manage your profile, plan, credits, and future billing details from
                        this page.
                    </p>

                    <div className="mt-8 grid gap-4">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-bold text-slate-500">Email</p>
                            <p className="mt-2 text-lg font-black text-slate-950">
                                {user.email}
                            </p>
                        </div>
                        <div className="mt-6">
                            <ProWaitlistButton />
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-bold text-slate-500">Current plan</p>
                            <p className="mt-2 text-lg font-black text-slate-950">
                                Free / Development
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-bold text-slate-500">
                                Payment status
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-950">
                                Real payments will be activated later.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardShell>
    );
}