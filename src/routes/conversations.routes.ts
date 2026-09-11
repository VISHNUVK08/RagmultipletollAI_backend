import { Router } from "express";
import {
    listConversations,
    getMessages,
    deleteConversation,
} from "../memory/conversation.repository.js";

const router = Router();

// GET /api/conversations — list all conversations
router.get("/", (_req, res) => {
    const conversations = listConversations();
    return res.json({ conversations });
});

// GET /api/conversations/:id/messages — get messages for a conversation
router.get("/:id/messages", (req, res) => {
    const messages = getMessages(req.params.id);
    return res.json({ messages });
});

// DELETE /api/conversations/:id — delete a conversation
router.delete("/:id", (req, res) => {
    deleteConversation(req.params.id);
    return res.json({ success: true });
});

export default router;
