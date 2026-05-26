import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

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

function normalizeRating(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const rating = Number(value);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Invalid admin quality rating.");
    }

    return rating;
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await context.params;
        const body = await request.json();

        const selectedForTraining = Boolean(body.selectedForTraining);
        const adminQualityRating = normalizeRating(body.adminQualityRating);
        const adminNotes =
            typeof body.adminNotes === "string" ? body.adminNotes : null;

        const { error } = await supabaseAdmin
            .from("generations")
            .update({
                selected_for_training: selectedForTraining,
                admin_quality_rating: adminQualityRating,
                admin_notes: adminNotes
            })
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true
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
                        : "Could not update generation review."
            },
            { status: 500 }
        );
    }
}