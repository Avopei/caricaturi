import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";

export const runtime = "nodejs";

type AppSettings = {
    freePlanLimit: number;
    proPlanLimit: number;
    studioPlanLimit: number;
};

function isValidLimit(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export async function GET() {
    try {
        await requireAdminApiUser();

        const { data, error } = await supabaseAdmin
            .from("app_settings")
            .select("free_plan_limit, pro_plan_limit, studio_plan_limit")
            .eq("id", 1)
            .single();

        if (error || !data) {
            throw new Error(error?.message || "App settings row was not found.");
        }

        const settings: AppSettings = {
            freePlanLimit: data.free_plan_limit,
            proPlanLimit: data.pro_plan_limit,
            studioPlanLimit: data.studio_plan_limit
        };

        return NextResponse.json(settings);
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
                        : "Could not load app settings."
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        await requireAdminApiUser();

        const body = await request.json();

        const { freePlanLimit, proPlanLimit, studioPlanLimit } = body;

        if (
            !isValidLimit(freePlanLimit) ||
            !isValidLimit(proPlanLimit) ||
            !isValidLimit(studioPlanLimit)
        ) {
            return NextResponse.json(
                { error: "All plan limits must be non-negative integers." },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("app_settings")
            .update({
                free_plan_limit: freePlanLimit,
                pro_plan_limit: proPlanLimit,
                studio_plan_limit: studioPlanLimit
            })
            .eq("id", 1);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            freePlanLimit,
            proPlanLimit,
            studioPlanLimit
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
                        : "Could not update app settings."
            },
            { status: 500 }
        );
    }
}
