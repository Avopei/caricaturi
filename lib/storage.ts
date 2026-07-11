import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "Caricatures";

type UploadFileToStorageInput = {
    path: string;
    buffer: Buffer;
    contentType: string;
};

type DownloadedStorageFile = {
    buffer: Buffer;
    contentType: string;
};

export async function uploadFileToStorage({
                                              path,
                                              buffer,
                                              contentType
                                          }: UploadFileToStorageInput): Promise<string> {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error("Supabase uploadFileToStorage error:", {
            bucket: BUCKET_NAME,
            path,
            message: error.message
        });

        throw new Error(`Storage upload failed: ${error.message}`);
    }

    return path;
}

export async function createSignedUrl(
    path: string,
    expiresIn = 60 * 60
): Promise<string> {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
        console.error("Supabase createSignedUrl error:", {
            bucket: BUCKET_NAME,
            path,
            message: error?.message
        });

        throw new Error(error?.message || "Could not create signed URL.");
    }

    return data.signedUrl;
}

export async function downloadFileFromStorage(path: string): Promise<DownloadedStorageFile> {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(path);

    if (error || !data) {
        console.error("Supabase downloadFileFromStorage error:", {
            bucket: BUCKET_NAME,
            path,
            message: error?.message
        });

        throw new Error(error?.message || "Could not download file from storage.");
    }

    const arrayBuffer = await data.arrayBuffer();

    return {
        buffer: Buffer.from(arrayBuffer),
        contentType: data.type || "application/octet-stream"
    };
}

export async function deleteFilesFromStorage(paths: string[]): Promise<void> {
    if (!paths.length) {
        return;
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(paths);

    if (error) {
        console.error("Supabase deleteFilesFromStorage error:", {
            bucket: BUCKET_NAME,
            paths,
            message: error.message
        });

        throw new Error(`Could not delete files from storage: ${error.message}`);
    }
}
