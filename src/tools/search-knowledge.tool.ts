import { retrieveRelevantChunks } from "../rag/retrieval.service.js";

export async function searchKnowledgeBase(
    query: string
) {
    return await retrieveRelevantChunks(query, 3);
}