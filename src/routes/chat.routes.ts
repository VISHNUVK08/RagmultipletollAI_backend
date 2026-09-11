import { Router } from "express";
import { runAgent } from "../agent/agent.service.js";
import {
    createConversation,
    saveMessage,
    getMessages,
} from "../memory/conversation.repository.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Load prior messages for short-term memory context
        let convId: string = conversationId;
        const priorMessages = convId ? getMessages(convId) : [];

        // Build conversation context string for the agent
        const context =
            priorMessages.length > 0
                ? priorMessages
                      .slice(-10) // last 10 messages
                      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
                      .join("\n")
                : "";

        const fullMessage = context
            ? `[Previous conversation]\n${context}\n\n[New message]\n${message}`
            : message;

        const answer = await runAgent(fullMessage);

        // Create conversation on first message
        if (!convId) {
            const conv = createConversation(message);
            convId = conv.id;
        }

        // Save both turns
        saveMessage(convId, "user", message);
        saveMessage(convId, "assistant", answer);

        return res.json({ answer, conversationId: convId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;