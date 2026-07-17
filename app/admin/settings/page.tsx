import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export default function AdminSettingsPage() {
    return (
        <section className="border border-line bg-paper p-6">
            <h2 className="font-display text-2xl tracking-[-0.01em]">Plan limits</h2>
            <p className="mt-1 text-sm text-mute">
                Applies to any user without a per-account override in Users.
            </p>

            <div className="mt-6">
                <AdminSettingsForm />
            </div>
        </section>
    );
}
