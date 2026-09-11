import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import path from "path";

let client: Client | null = null;
let transport: StdioClientTransport | null = null;

export async function connectToMcpServer() {
    if (client) {
        return client;
    }

    const mcpServerPath = path.resolve(
        process.cwd(),
        "../mcp-server/src/server.ts"
    );

    client = new Client({
        name: "miniagent-backend",
        version: "1.0.0",
    });

    transport = new StdioClientTransport({
        command: "npx",
        args: ["tsx", mcpServerPath],
    });

    await client.connect(transport);

    console.log("Connected to MCP server.");

    return client;
}

export async function listMcpTools() {
    const mcpClient = await connectToMcpServer();

    const result = await mcpClient.listTools();

    return result.tools;
}

export async function callMcpTool(
    toolName: string,
    arguments_: Record<string, unknown>
) {
    const mcpClient = await connectToMcpServer();

    return await mcpClient.callTool({
        name: toolName,
        arguments: arguments_,
    });
}

export async function closeMcpClient() {
    if (client) {
        await client.close();

        client = null;
        transport = null;

        console.log("MCP client disconnected.");
    }
}