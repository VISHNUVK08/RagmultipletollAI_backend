import fs from "fs/promises";
import path from "path";

export interface DocumentData {
    filename: string;
    content: string;
}

export async function loadDocuments(
    documentsPath: string
): Promise<DocumentData[]> {
    const files = await fs.readdir(documentsPath);

    const documents: DocumentData[] = [];

    for (const file of files) {
        const filePath = path.join(documentsPath, file);

        const content = await fs.readFile(filePath, "utf-8");

        documents.push({
            filename: file,
            content,
        });
    }

    return documents;
}