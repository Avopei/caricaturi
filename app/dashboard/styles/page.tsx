import { ComingSoonToolPage } from "@/components/ComingSoonToolPage";
import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function StylesPage() {
    const user = await requireUser();

    return (
        <DashboardShell email={user.email}>
            <ComingSoonToolPage
                icon="SR"
                title="Style Review"
                description="Review planned style options for future portrait workflows."
                features={[
                    "Realistic hand-drawn portrait",
                    "Classic line caricature",
                    "Vintage portrait",
                    "Editorial portrait",
                    "Illustrated profile image",
                    "Cinematic portrait"
                ]}
            />
        </DashboardShell>
    );
}
