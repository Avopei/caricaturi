import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProfilePlanInfo, UserPlan } from "@/types/caricature";

export const runtime = "nodejs";

const FREE_GENERATION_LIMIT = 1;

function isValidPlan(value: unknown): value is UserPlan {
    return value === "free" || value === "pro" || value === "admin";
}

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be signed in." },
                { status: 401 }
            );
        }

        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("plan, free_generations_used")
            .eq("id", user.id)
            .single();

        if (error || !profile) {
            throw new Error("User profile was not found.");
        }

        const plan: UserPlan = isValidPlan(profile.plan) ? profile.plan : "free";
        const freeGenerationsUsed = Number(profile.free_generations_used || 0);

        const info: ProfilePlanInfo = {
            plan,
            freeGenerationsUsed,
            freeGenerationLimit: FREE_GENERATION_LIMIT,
            remainingFreeGenerations:
                plan === "free"
                    ? Math.max(0, FREE_GENERATION_LIMIT - freeGenerationsUsed)
                    : 999
        };

        return NextResponse.json(info);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load plan information."
            },
            { status: 500 }
        );
    }
}