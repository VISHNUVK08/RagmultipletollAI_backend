import OpenAI from "openai";

import {
    listMcpTools,
    callMcpTool,
} from "../mcp/mcp-client.service.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type AgentTool = {
    type: "function";
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict: boolean;
};//vk

async function getMcpToolsForOpenAI(): Promise<AgentTool[]> {
    const mcpTools = await listMcpTools();

    return mcpTools.map((tool) => ({
        type: "function",
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema as Record<string, unknown>,
        strict: false,
    }));
}

export async function runAgent(
    userMessage: string
): Promise<string> {
    const tools = await getMcpToolsForOpenAI();

    let response = await client.responses.create({
        model: "gpt-5.6-luna",

        instructions: `
You are MiniAgentAI.

You are a helpful AI research assistant.

You can use tools provided through MCP.

When a tool is useful, call the appropriate tool.

Do not invent tool results.

After receiving a tool result, use it to answer the user.
`,

        input: userMessage,

        tools,
    });

    while (true) {
        const toolCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        if (toolCalls.length === 0) {
            break;
        }

        const toolOutputs = [];

        for (const toolCall of toolCalls) {
            console.log(
                `MCP tool requested: ${toolCall.name}`
            );

            console.log(
                `Arguments: ${toolCall.arguments}`
            );

            const argumentsObject = JSON.parse(
                toolCall.arguments
            );

            const result = await callMcpTool(
                toolCall.name,
                argumentsObject
            );

            toolOutputs.push({
                type: "function_call_output" as const,

                call_id: toolCall.call_id,

                output: JSON.stringify(result),
            });
        }

        response = await client.responses.create({
            model: "gpt-5.6-luna",

            previous_response_id: response.id,

            input: toolOutputs,
        });
    }

    return response.output_text;
}