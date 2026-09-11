import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { chunkText } from "../rag/chunker.js";
import { createEmbedding } from "../rag/embedding.service.js";
import { getCollection } from "../rag/chroma.service.js";

const router = Router();

// Store file in memory so we can process it before saving
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const allowed = [".txt", ".md"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only .txt and .md files are supported."));
        }
    },
});

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided." });
        }

        const filename = req.file.originalname;
        const content = req.file.buffer.toString("utf-8");

        if (!content.trim()) {
            return res.status(400).json({ error: "File is empty." });
        }

        // Save file to the documents folder
        const documentsPath = path.join(process.cwd(), "documents");
        await fs.mkdir(documentsPath, { recursive: true });
        await fs.writeFile(path.join(documentsPath, filename), content, "utf-8");

        // Ingest into ChromaDB
        const collection = await getCollection();
        const chunks = chunkText(content);

        for (const chunk of chunks) {
            const embedding = await createEmbedding(chunk.content);
            const id = `${filename}-${chunk.chunkIndex}`;
            await collection.upsert({
                ids: [id],
                embeddings: [embedding],
                documents: [chunk.content],
                metadatas: [{ filename, chunkIndex: chunk.chunkIndex }],
            });
        }

        console.log(`Uploaded and ingested: ${filename} (${chunks.length} chunks)`);

        return res.json({
            success: true,
            message: `${filename} uploaded and added to the knowledge base.`,
            chunks: chunks.length,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Upload failed.",
        });
    }
});

export default router;
