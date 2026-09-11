import "dotenv/config";

import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import conversationsRoutes from "./routes/conversations.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/conversations", conversationsRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});