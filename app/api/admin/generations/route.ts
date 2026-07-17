import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminAuthErrorResponse, requireAdminApiUser } from "@/lib/admin";
import { createSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 20;

async function resolvePreviewUrl(path: string | null) {
    if (!path) {
        return null;
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    try {
        return await createSignedUrl(path);
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        await requireAdminApiUser();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const pageSize = Math.min(
            100,
            Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE)
        );

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabaseAdmin
            .from("generations")
            .select(
                "id, user_id, tool, preset, preview_image_path, storage_path, style, intensity, payment_status, feedback_rating, download_count, selected_for_training, admin_quality_rating, admin_notes, created_at",
                { count: "exact" }
            )
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            throw new Error(error.message);
        }

        const rows = data || [];
        const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];

        const emailByUserId = new Map<string, string | null>();

        if (userIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from("profiles")
                .select("id, email")
                .in("id", userIds);

            (profiles || []).forEach((profile) => {
                emailByUserId.set(profile.id, profile.email);
            });
        }

        const generations = await Promise.all(
            rows.map(async (generation) => ({
                id: generation.id,
                userId: generation.user_id,
                userEmail: generation.user_id
                    ? emailByUserId.get(generation.user_id) || null
                    : null,
                tool: generation.tool,
                preset: generation.preset,
                previewImage: await resolvePreviewUrl(
                    generation.preview_image_path || generation.storage_path
                ),
                style: generation.style,
                intensity: generation.intensity,
                paymentStatus: generation.payment_status,
                feedbackRating: generation.feedback_rating,
                downloadCount: generation.download_count || 0,
                selectedForTraining: Boolean(generation.selected_for_training),
                adminQualityRating: generation.admin_quality_rating,
                adminNotes: generation.admin_notes,
                createdAt: generation.created_at
            }))
        );

        return NextResponse.json({
            generations,
            page,
            pageSize,
            total: count || 0
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
                        : "Could not load admin generations."
            },
            { status: 500 }
        );
    }
}
