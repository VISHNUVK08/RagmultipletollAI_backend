import { randomUUID } from "crypto";

export interface User {
    id: string;
    created_at: Date;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: Date;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: Date;
}

export interface Memory {
    id: string;
    user_id: string;
    memory: string;
    type: "preference" | "project" | "fact";
    created_at: Date;
    updated_at: Date;
}

class DummyDatabase {
    // These arrays represent our PostgreSQL tables
    public users: User[] = [];
    public conversations: Conversation[] = [];
    public messages: Message[] = [];
    public memories: Memory[] = [];

    // Utility to simulate database ID generation
    public generateId(): string {
        return randomUUID();
    }
}

// Export a singleton instance to simulate our shared database connection pool
export const db = new DummyDatabase();
