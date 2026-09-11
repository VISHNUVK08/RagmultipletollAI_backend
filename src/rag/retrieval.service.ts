import { getCollection } from "./chroma.service.js";
import { createEmbedding } from "./embedding.service.js";

export interface RetrievedChunk {
    content: string;
    filename: string;
    chunkIndex: number;
    distance?: number;
}

export async function retrieveRelevantChunks(
    question: string,
    topK: number = 3
): Promise<RetrievedChunk[]> {
    // Get ChromaDB collection
    const collection = await getCollection();

    // Convert the user's question into an embedding
    const questionEmbedding = await createEmbedding(question);

    // Search ChromaDB
    const results = await collection.query({
        queryEmbeddings: [questionEmbedding],
        nResults: topK,
    });

    const documents = results.documents?.[0] ?? [];
    const metadatas = results.metadatas?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];

    const retrievedChunks: RetrievedChunk[] = [];

    for (let i = 0; i < documents.length; i++) {
        const metadata = metadatas[i] ?? {};

        const chunk: RetrievedChunk = {
            content: documents[i] ?? "",
            filename: String(metadata.filename ?? "unknown"),
            chunkIndex: Number(metadata.chunkIndex ?? 0),
        };

        const distance = distances[i];
        if (distance != null) {
            chunk.distance = distance;
        }

        retrievedChunks.push(chunk);
    }

    return retrievedChunks;
}