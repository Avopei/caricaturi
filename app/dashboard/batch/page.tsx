import { ComingSoonToolPage } from "@/components/ComingSoonToolPage";
import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function BatchPage() {
    const user = await requireUser();

    return (
        <DashboardShell email={user.email}>
            <ComingSoonToolPage
                icon="BT"
                badge="Coming soon"
                title="Batch Tools"
                description="Prepare multi-image workflows for repeatable portrait processing."
                features={[
                    "Upload multiple photos",
                    "Apply the same style to all images",
                    "Bulk export",
                    "Project-based organization",
                    "Project-based history",
                    "Planned Pro workflow"
                ]}
            />
        </DashboardShell>
    );
}
