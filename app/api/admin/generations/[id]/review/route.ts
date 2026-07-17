import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

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
        await requireAdminApiUser();

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
        const authResponse = adminAuthErrorResponse(error);

        if (authResponse) {
            return authResponse;
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