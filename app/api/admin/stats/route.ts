import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

    if (error || !profile || profile.plan !== "admin") {
        throw new Error("FORBIDDEN");
    }

    return user;
}

export async function GET() {
    try {
        await requireAdmin();

        const [
            profilesResult,
            generationsResult,
            lockedResult,
            unlockedResult,
            feedbackResult,
            waitlistResult,
            latestWaitlistResult
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
                .limit(10)
        ]);

        return NextResponse.json({
            totalUsers: profilesResult.count || 0,
            totalGenerations: generationsResult.count || 0,
            lockedGenerations: lockedResult.count || 0,
            unlockedGenerations: unlockedResult.count || 0,
            feedbackCount: feedbackResult.count || 0,
            waitlistCount: waitlistResult.count || 0,
            latestWaitlist: latestWaitlistResult.data || []
        });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message === "FORBIDDEN") {
            return NextResponse.json(
                { error: "Admin access required." },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load admin stats."
            },
            { status: 500 }
        );
    }
}