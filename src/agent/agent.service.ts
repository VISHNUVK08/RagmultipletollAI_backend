import OpenAI from "openai";

import { calculator } from "../tools/calculator.tool.js";
import { getCurrentTime } from "../tools/time.tool.js";
import { searchKnowledgeBase } from "../tools/search-knowledge.tool.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function runAgent(
    userMessage: string
): Promise<string> {
    const tools = [
        {
            type: "function" as const,
            strict: true,
            name: "calculator",
            description:
                "Calculate a mathematical expression and return the numeric result.",
            parameters: {
                type: "object",
                properties: {
                    expression: {
                        type: "string",
                        description:
                            "The mathematical expression to calculate.",
                    },
                },
                required: ["expression"],
                additionalProperties: false,
            },
        },

        {
            type: "function" as const,
            strict: true,
            name: "get_current_time",
            description:
                "Get the current server time in ISO format.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
        },

        {
            type: "function" as const,
            strict: true,
            name: "search_knowledge_base",
            description:
                "Search the application's document knowledge base for relevant information. Use this when the user asks about information that may exist in the uploaded documents.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description:
                            "The search query to find relevant information in the knowledge base.",
                    },
                },
                required: ["query"],
                additionalProperties: false,
            },
        },
    ];

    let response = await client.responses.create({
        model: "gpt-5.6",

        instructions: `
You are MiniAgentAI, a helpful AI assistant.

You have access to several tools:

1. calculator
   Use this for mathematical calculations.

2. get_current_time
   Use this when the user asks for the current time.

3. search_knowledge_base
   Use this when the answer may be found in the application's documents.

Choose the appropriate tool when necessary.

If you use information from the knowledge base, answer using
that information and mention the relevant document source.

If no tool is necessary, answer normally.
`,

        input: userMessage,

        tools,
    });

    while (true) {
        const toolCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        // No tool call means the agent has finished.
        if (toolCalls.length === 0) {
            return response.output_text;
        }

        const toolOutputs = [];

        for (const toolCall of toolCalls) {
            if (toolCall.type !== "function_call") {
                continue;
            }

            try {
                const args = JSON.parse(toolCall.arguments);

                // --------------------------------
                // Calculator
                // --------------------------------

                if (toolCall.name === "calculator") {
                    const result = calculator(args.expression);

                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: String(result),
                    });
                }

                // --------------------------------
                // Current Time
                // --------------------------------

                else if (
                    toolCall.name === "get_current_time"
                ) {
                    const result = getCurrentTime();

                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: result,
                    });
                }

                // --------------------------------
                // Knowledge Base / RAG
                // --------------------------------

                else if (
                    toolCall.name === "search_knowledge_base"
                ) {
                    const results = await searchKnowledgeBase(
                        args.query
                    );

                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: JSON.stringify(results),
                    });
                }

                // --------------------------------
                // Unknown Tool
                // --------------------------------

                else {
                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: `Unknown tool: ${toolCall.name}`,
                    });
                }
            } catch (error) {
                console.error(
                    `Tool execution failed: ${toolCall.name}`,
                    error
                );

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output: "Tool execution failed.",
                });
            }
        }

        // Send tool results back to the LLM.
        response = await client.responses.create({
            model: "gpt-5.6",

            previous_response_id: response.id,

            input: toolOutputs,
        });
    }
}