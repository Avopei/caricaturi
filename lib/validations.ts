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