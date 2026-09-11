export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;

export function validateAndFormatImage(
    mimeType: string,
    size: number,
    buffer: Buffer
): string {
    if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
        throw new Error(
            `Unsupported image format: ${mimeType}. Supported formats are JPEG, PNG, and WEBP.`
        );
    }

    const sizeInMB = size / (1024 * 1024);
    if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        throw new Error(
            `Image size ${sizeInMB.toFixed(
                2
            )}MB exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.`
        );
    }

    if (!buffer || buffer.length === 0) {
        throw new Error("Invalid image data: empty buffer.");
    }

    const base64Data = buffer.toString("base64");
    
    return `data:${mimeType};base64,${base64Data}`;
}
