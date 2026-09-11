export interface Chunk {
    content: string;
    chunkIndex: number;
}

export function chunkText(
    text: string,
    chunkSize = 500,
    overlap = 100
): Chunk[] {
    const chunks: Chunk[] = [];

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);

        const content = text.slice(start, end).trim();

        if (content.length > 0) {
            chunks.push({
                content,
                chunkIndex,
            });

            chunkIndex++;
        }

        start += chunkSize - overlap;
    }

    return chunks;
}