import { db } from "../memory/db.service.js";
import type { Conversation, Message } from "../memory/db.service.js";

// ── Conversations ──────────────────────────────────────────

export function createConversation(firstUserMessage: string): Conversation {
    const title =
        firstUserMessage.length > 45
            ? firstUserMessage.slice(0, 45) + "…"
            : firstUserMessage;

    const conv: Conversation = {
        id: db.generateId(),
        user_id: "default",
        title,
        created_at: new Date(),
    };

    db.conversations.unshift(conv); // newest first
    return conv;
}

export function listConversations(): Conversation[] {
    return db.conversations;
}

export function getConversation(id: string): Conversation | undefined {
    return db.conversations.find((c) => c.id === id);
}

export function deleteConversation(id: string): void {
    db.conversations = db.conversations.filter((c) => c.id !== id);
    db.messages = db.messages.filter((m) => m.conversation_id !== id);
}

// ── Messages ───────────────────────────────────────────────

export function saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
): Message {
    const msg: Message = {
        id: db.generateId(),
        conversation_id: conversationId,
        role,
        content,
        created_at: new Date(),
    };
    db.messages.push(msg);
    return msg;
}

export function getMessages(conversationId: string): Message[] {
    return db.messages.filter((m) => m.conversation_id === conversationId);
}
