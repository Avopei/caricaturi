import JSZip from "jszip";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { downloadFileFromStorage } from "@/lib/storage";

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

function getExtension(contentType: string) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
    if (contentType.includes("webp")) return "webp";

    return "png";
}

export async function GET() {
    try {
        await requireAdmin();

        const { data, error } = await supabaseAdmin
            .from("generations")
            .select(
                `
        id,
        user_id,
        original_image_path,
        final_image_path,
        preview_image_path,
        style,
        intensity,
        prompt_used,
        variation_token,
        feedback_rating,
        download_count,
        selected_for_training,
        admin_quality_rating,
        admin_notes,
        created_at
      `
            )
            .eq("selected_for_training", true)
            .order("admin_quality_rating", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        const selected = data || [];
        const zip = new JSZip();

        const metadata = [];

        for (const generation of selected) {
            const baseName = generation.id;

            const itemMetadata = {
                id: generation.id,
                userId: generation.user_id,
                style: generation.style,
                intensity: generation.intensity,
                promptUsed: generation.prompt_used,
                variationToken: generation.variation_token,
                feedbackRating: generation.feedback_rating,
                downloadCount: generation.download_count || 0,
                selectedForTraining: generation.selected_for_training,
                adminQualityRating: generation.admin_quality_rating,
                adminNotes: generation.admin_notes,
                createdAt: generation.created_at,
                files: {
                    original: null as string | null,
                    final: null as string | null,
                    preview: null as string | null
                }
            };

            if (generation.original_image_path) {
                try {
                    const original = await downloadFileFromStorage(
                        generation.original_image_path
                    );

                    const extension = getExtension(original.contentType);
                    const fileName = `originals/${baseName}.${extension}`;

                    zip.file(fileName, original.buffer);
                    itemMetadata.files.original = fileName;
                } catch (error) {
                    console.error("ZIP_ORIGINAL_ERROR:", generation.id, error);
                }
            }

            if (generation.final_image_path) {
                try {
                    const final = await downloadFileFromStorage(generation.final_image_path);
                    const extension = getExtension(final.contentType);
                    const fileName = `finals/${baseName}.${extension}`;

                    zip.file(fileName, final.buffer);
                    itemMetadata.files.final = fileName;
                } catch (error) {
                    console.error("ZIP_FINAL_ERROR:", generation.id, error);
                }
            }

            if (generation.preview_image_path) {
                try {
                    const preview = await downloadFileFromStorage(
                        generation.preview_image_path
                    );

                    const extension = getExtension(preview.contentType);
                    const fileName = `previews/${baseName}.${extension}`;

                    zip.file(fileName, preview.buffer);
                    itemMetadata.files.preview = fileName;
                } catch (error) {
                    console.error("ZIP_PREVIEW_ERROR:", generation.id, error);
                }
            }

            metadata.push(itemMetadata);
        }

        zip.file(
            "metadata.json",
            JSON.stringify(
                {
                    exportedAt: new Date().toISOString(),
                    count: metadata.length,
                    dataset: metadata
                },
                null,
                2
            )
        );

        zip.file(
            "README.txt",
            [
                "PortraitLab Studio Dataset Export",
                "",
                "Folders:",
                "- originals: uploaded source photos",
                "- finals: generated final outputs",
                "- previews: protected preview images",
                "- metadata.json: prompt, style, rating, feedback, notes, and file mapping",
                "",
                "Use only high-quality, identity-preserving examples for LoRA training."
            ].join("\n")
        );

        const zipBuffer = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        });

        const date = new Date().toISOString().slice(0, 10);

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="lora-dataset-${date}.zip"`,
                "Cache-Control": "private, no-store"
            }
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
                        : "Could not export LoRA dataset ZIP."
            },
            { status: 500 }
        );
    }
}
