import {
    connectToMcpServer,
    listMcpTools,
    callMcpTool,
    closeMcpClient,
} from "./mcp-client.service.js";

async function main() {
    try {
        console.log("Connecting to MCP server...");

        await connectToMcpServer();

        console.log("\nAvailable MCP tools:");

        const tools = await listMcpTools();

        for (const tool of tools) {
            console.log(`- ${tool.name}`);
            console.log(`  ${tool.description}`);
        }

        console.log("\nCalling calculate tool...");

        const result = await callMcpTool("calculate", {
            expression: "25 * 4",
        });

        console.log("\nMCP tool result:");

        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("MCP test failed:", error);
    } finally {
        await closeMcpClient();
    }
}

main();