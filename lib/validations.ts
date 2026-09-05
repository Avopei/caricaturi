import type {
    CaricatureIntensity,
    CaricatureStyle
} from "@/types/caricature";

const MAX_IMAGE_SIZE_MB = 8;

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export function validateImageFile(file: File) {
    if (!allowedImageTypes.includes(file.type)) {
        throw new Error("Invalid file format. Please upload a JPG, PNG, or WEBP image.");
    }

    const sizeInMb = file.size / 1024 / 1024;

    if (sizeInMb > MAX_IMAGE_SIZE_MB) {
        throw new Error(`Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
    }
}

export const allowedStyles: CaricatureStyle[] = [
    "realistic_human_drawn",
    "classic_line_art",
    "black_white_sketch",
    "street_caricature",
    "classic_color",
    "comic_caricature"
];

export const allowedIntensities: CaricatureIntensity[] = ["low", "medium", "high"];

export function validateStyle(value: FormDataEntryValue | null): CaricatureStyle {
    if (typeof value !== "string") {
        return "realistic_human_drawn";
    }

    if (allowedStyles.includes(value as CaricatureStyle)) {
        return value as CaricatureStyle;
    }

    return "realistic_human_drawn";
}

export function validateIntensity(value: FormDataEntryValue | null): CaricatureIntensity {
    if (typeof value !== "string") {
        return "low";
    }

    if (allowedIntensities.includes(value as CaricatureIntensity)) {
        return value as CaricatureIntensity;
    }

    return "low";
}