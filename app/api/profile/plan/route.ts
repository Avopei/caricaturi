import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProfilePlanInfo } from "@/types/caricature";
import { effectiveLimit, getOrCreateProfile, remainingGenerations } from "@/lib/plan";

export const runtime = "nodejs";

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

        const profile = await getOrCreateProfile(user.id, user.email);

        const info: ProfilePlanInfo = {
            plan: profile.plan,
            role: profile.role,
            freeGenerationsUsed: profile.free_generations_used,
            freeGenerationLimit: await effectiveLimit(profile),
            remainingFreeGenerations: await remainingGenerations(profile)
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
