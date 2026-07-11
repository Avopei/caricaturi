import BackgroundRemover from "@/components/BackgroundRemover";
import { DashboardShell } from "@/components/DashboardShell";

export default function BackgroundPage() {
    return (
        <DashboardShell>
            <BackgroundRemover />
        </DashboardShell>
    );
}
