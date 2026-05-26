import { ComingSoonToolPage } from "@/components/ComingSoonToolPage";
import { DashboardShell } from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function AvatarPage() {
    const user = await requireUser();

    return (
        <DashboardShell email={user.email}>
            <ComingSoonToolPage
                icon="AS"
                title="Avatar Studio"
                description="Plan profile-ready avatar variants for social and professional use."
                features={[
                    "Gaming avatar concept",
                    "Cartoon profile picture concept",
                    "Professional avatar concept",
                    "Social media profile image",
                    "Avatar with custom background",
                    "Export for Instagram, TikTok, LinkedIn"
                ]}
            />
        </DashboardShell>
    );
}
