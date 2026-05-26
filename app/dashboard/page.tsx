import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/DashboardHome";
import { DashboardShell } from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    return (
        <DashboardShell email={user.email}>
            <DashboardHome />
        </DashboardShell>
    );
}