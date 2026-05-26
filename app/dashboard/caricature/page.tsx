import { redirect } from "next/navigation";
import { CaricatureGenerator } from "@/components/CaricatureGenerator";
import { DashboardShell } from "@/components/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export default async function CaricaturePage() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    return (
        <DashboardShell email={user.email}>
            <CaricatureGenerator />
        </DashboardShell>
    );
}