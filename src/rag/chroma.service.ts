import { ChromaClient } from "chromadb";

const client = new ChromaClient({
    path: "http://localhost:8000",
});

export async function getCollection() {
    return await client.getOrCreateCollection({
        name: "miniagent_documents",
    });
}