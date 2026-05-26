export type CompressImageOptions = {
    maxDimension?: number;
    quality?: number;
};

export async function compressImageFile(
    file: File,
    options: CompressImageOptions = {}
): Promise<File> {
    const maxDimension = options.maxDimension ?? 1280;
    const quality = options.quality ?? 0.82;

    if (!file.type.startsWith("image/")) {
        return file;
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = await loadImage(imageUrl);

        const { width, height } = getResizedDimensions(
            image.width,
            image.height,
            maxDimension
        );

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
            return file;
        }

        context.drawImage(image, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", quality);
        });

        if (!blob) {
            return file;
        }

        return new File([blob], replaceExtension(file.name, "jpg"), {
            type: "image/jpeg",
            lastModified: Date.now()
        });
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load image."));
        image.src = src;
    });
}

function getResizedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxDimension: number
) {
    if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
        return {
            width: originalWidth,
            height: originalHeight
        };
    }

    const ratio = Math.min(
        maxDimension / originalWidth,
        maxDimension / originalHeight
    );

    return {
        width: Math.round(originalWidth * ratio),
        height: Math.round(originalHeight * ratio)
    };
}

function replaceExtension(filename: string, extension: string) {
    const cleanName = filename.replace(/\.[^/.]+$/, "");
    return `${cleanName}.${extension}`;
}