import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const supabase = await createClient();

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    error: "You must be signed in."
                },
                {
                    status: 401
                }
            );
        }

        const body = await request.json();
        const rating = body.rating;

        if (rating !== "good" && rating !== "needs_improvement") {
            return NextResponse.json(
                {
                    error: "Invalid feedback rating."
                },
                {
                    status: 400
                }
            );
        }

        const { error } = await supabase
            .from("generations")
            .update({
                feedback_rating: rating,
                feedback_created_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json(
                {
                    error: error.message
                },
                {
                    status: 500
                }
            );
        }

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Could not save feedback."
            },
            {
                status: 500
            }
        );
    }
}