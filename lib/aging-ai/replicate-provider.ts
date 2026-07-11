import type { AgingPreset } from "@/lib/aging-ai/types";

type GenerateWithReplicateInput = {
    imageFile: File;
    agePreset: AgingPreset;
    prompt: string;
};

type ReplicatePredictionStatus =
    | "starting"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled";

type ReplicatePrediction = {
    id?: string;
    status?: ReplicatePredictionStatus;
    output?: unknown;
    error?: unknown;
    urls?: {
        get?: string;
    };
};

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const DEFAULT_REPLICATE_AGING_MODEL = "yuval-alaluf/sam";

const targetAges: Record<AgingPreset, number> = {
    age_10: 40,
    age_20: 50,
    age_35: 65,
    senior: 75
};

export async function generateWithReplicate({
                                                imageFile,
                                                agePreset,
                                                prompt
                                            }: GenerateWithReplicateInput): Promise<{
    imageUrl: string;
}> {
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
        throw new Error(
            "REPLICATE_API_TOKEN is missing. Add REPLICATE_API_TOKEN to .env.local to use AI aging."
        );
    }

    const model = process.env.REPLICATE_AGING_MODEL || DEFAULT_REPLICATE_AGING_MODEL;
    const imageDataUrl = await fileToDataUrl(imageFile);
    const targetAge = targetAges[agePreset];

    const prediction = await createPrediction({
        token,
        model,
        // TODO: Confirm the exact input keys for the configured Replicate model.
        // yuval-alaluf/sam-style age progression models commonly need an image
        // plus target age; alternate models may use input_image, target_age, age,
        // or a different prompt field. Keep those adjustments isolated here.
        input: {
            image: imageDataUrl,
            input_image: imageDataUrl,
            prompt,
            target_age: targetAge,
            age: targetAge
        }
    });

    const completedPrediction =
        prediction.status === "succeeded" || prediction.status === "failed"
            ? prediction
            : await pollPrediction(prediction, token);

    if (completedPrediction.status === "failed" || completedPrediction.status === "canceled") {
        throw new Error(formatReplicateError(completedPrediction.error));
    }

    const imageUrl = extractOutputImageUrl(completedPrediction.output);

    if (!imageUrl) {
        throw new Error("Replicate completed without returning an output image URL.");
    }

    // TODO: Replicate output URLs are temporary. Persist this image to Supabase Storage
    // here or in the API route when the product flow needs durable aging history.
    return { imageUrl };
}

async function createPrediction({
                                    token,
                                    model,
                                    input
                                }: {
    token: string;
    model: string;
    input: Record<string, unknown>;
}): Promise<ReplicatePrediction> {
    const modelEndpoint = getPredictionEndpoint(model);
    const body =
        modelEndpoint.kind === "version"
            ? { version: modelEndpoint.version, input }
            : { input };

    const response = await fetch(modelEndpoint.url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Prefer: "wait=60"
        },
        body: JSON.stringify(body)
    });
    const payload = (await readJson(response)) as ReplicatePrediction;

    if (!response.ok) {
        throw new Error(formatReplicateError(payload.error || payload));
    }

    return payload;
}

function getPredictionEndpoint(model: string):
    | { kind: "model"; url: string }
    | { kind: "version"; url: string; version: string } {
    const ownerModelWithVersion = model.match(/^([^/]+)\/([^:]+):(.+)$/);

    if (ownerModelWithVersion) {
        return {
            kind: "version",
            url: `${REPLICATE_API_BASE}/predictions`,
            version: ownerModelWithVersion[3]
        };
    }

    const ownerModel = model.match(/^([^/]+)\/([^/]+)$/);

    if (ownerModel) {
        return {
            kind: "model",
            url: `${REPLICATE_API_BASE}/models/${ownerModel[1]}/${ownerModel[2]}/predictions`
        };
    }

    return {
        kind: "version",
        url: `${REPLICATE_API_BASE}/predictions`,
        version: model
    };
}

async function pollPrediction(
    prediction: ReplicatePrediction,
    token: string
): Promise<ReplicatePrediction> {
    const getUrl =
        prediction.urls?.get ||
        (prediction.id ? `${REPLICATE_API_BASE}/predictions/${prediction.id}` : undefined);

    if (!getUrl) {
        throw new Error("Replicate did not return a prediction polling URL.");
    }

    for (let attempt = 0; attempt < 40; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const response = await fetch(getUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const payload = (await readJson(response)) as ReplicatePrediction;

        if (!response.ok) {
            throw new Error(formatReplicateError(payload.error || payload));
        }

        if (
            payload.status === "succeeded" ||
            payload.status === "failed" ||
            payload.status === "canceled"
        ) {
            return payload;
        }
    }

    throw new Error("Replicate aging prediction timed out.");
}

async function fileToDataUrl(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";

    return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function readJson(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function extractOutputImageUrl(output: unknown): string | undefined {
    if (typeof output === "string") {
        return output;
    }

    if (Array.isArray(output)) {
        const firstString = output.find((item): item is string => typeof item === "string");
        if (firstString) return firstString;

        const firstObjectUrl = output
            .map(extractOutputImageUrl)
            .find((url): url is string => Boolean(url));
        if (firstObjectUrl) return firstObjectUrl;
    }

    if (output && typeof output === "object") {
        const record = output as Record<string, unknown>;
        const candidates = [
            record.image,
            record.output,
            record.url,
            record.result,
            record.generated_image
        ];

        for (const candidate of candidates) {
            const url = extractOutputImageUrl(candidate);
            if (url) return url;
        }
    }

    return undefined;
}

function formatReplicateError(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object") {
        const record = error as Record<string, unknown>;
        if (typeof record.detail === "string") return record.detail;
        if (typeof record.message === "string") return record.message;
    }

    return "Replicate could not generate the aging result.";
}
