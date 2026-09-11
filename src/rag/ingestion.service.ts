import path from "path";

import { loadDocuments } from "./document.loader.js";
import { chunkText } from "./chunker.js";
import { createEmbedding } from "./embedding.service.js";
import { getCollection } from "./chroma.service.js";

export async function ingestDocuments(): Promise<void> {
    const documentsPath = path.join(process.cwd(), "documents");

    console.log("Starting document ingestion...");

    // Get ChromaDB collection
    const collection = await getCollection();

    // Load documents from the documents folder
    const documents = await loadDocuments(documentsPath);

    console.log(`Found ${documents.length} documents.`);

    for (const document of documents) {
        console.log(`Processing: ${document.filename}`);

        // Split document into chunks
        const chunks = chunkText(document.content);

        console.log(
            `${document.filename} → ${chunks.length} chunks`
        );

        for (const chunk of chunks) {
            // Generate embedding for this chunk
            const embedding = await createEmbedding(chunk.content);

            // Unique ID for this chunk
            const id = `${document.filename}-${chunk.chunkIndex}`;

            // Store chunk + embedding + metadata in ChromaDB
            await collection.upsert({
                ids: [id],

                embeddings: [embedding],

                documents: [chunk.content],

                metadatas: [
                    {
                        filename: document.filename,
                        chunkIndex: chunk.chunkIndex,
                    },
                ],
            });
        }

        console.log(`Finished: ${document.filename}`);
    }

    console.log("Document ingestion completed.");
}