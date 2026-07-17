import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
    try {
        await requireAdminApiUser();

        const [
            profilesResult,
            generationsResult,
            lockedResult,
            unlockedResult,
            feedbackResult,
            waitlistResult,
            latestWaitlistResult,
            caricatureResult,
            agingResult,
            backgroundResult
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
                .limit(10),
            supabaseAdmin
                .from("generations")
                .select("id", { count: "exact", head: true })
                .eq("tool", "caricature"),
            supabaseAdmin
                .from("generations")
                .select("id", { count: "exact", head: true })
                .eq("tool", "aging"),
            supabaseAdmin
                .from("generations")
                .select("id", { count: "exact", head: true })
                .eq("tool", "background")
        ]);

        return NextResponse.json({
            totalUsers: profilesResult.count || 0,
            totalGenerations: generationsResult.count || 0,
            lockedGenerations: lockedResult.count || 0,
            unlockedGenerations: unlockedResult.count || 0,
            feedbackCount: feedbackResult.count || 0,
            waitlistCount: waitlistResult.count || 0,
            latestWaitlist: latestWaitlistResult.data || [],
            generationsByTool: {
                caricature: caricatureResult.count || 0,
                aging: agingResult.count || 0,
                background: backgroundResult.count || 0
            }
        });
    } catch (error) {
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
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