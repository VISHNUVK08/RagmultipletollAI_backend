import OpenAI from "openai";

import { calculator } from "../tools/calculator.tool.js";
import { getCurrentTime } from "../tools/time.tool.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function askLLM(message: string): Promise<string> {
    // Define the tools that the LLM is allowed to use
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
                            "The mathematical expression to calculate, for example 25 * 10.",
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
            description: "Get the current server time.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
        },
    ];

    // First request to the LLM
    let response = await client.responses.create({
        model: "gpt-5.6",
        input: message,
        tools,
    });

    // Keep executing tools until the LLM gives us a final answer
    while (true) {
        // Find function/tool calls from the LLM response
        const toolCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        // If there are no tool calls, the LLM has finished
        if (toolCalls.length === 0) {
            return response.output_text;
        }

        // Store the results of all tool calls
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
            if (toolCall.type !== "function_call") {
                continue;
            }

            try {
                // -----------------------------
                // Calculator Tool
                // -----------------------------
                if (toolCall.name === "calculator") {
                    const args = JSON.parse(toolCall.arguments);

                    const result = calculator(args.expression);

                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: String(result),
                    });
                }

                // -----------------------------
                // Current Time Tool
                // -----------------------------
                else if (toolCall.name === "get_current_time") {
                    const result = getCurrentTime();

                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: result,
                    });
                }

                // -----------------------------
                // Unknown Tool
                // -----------------------------
                else {
                    toolOutputs.push({
                        type: "function_call_output" as const,
                        call_id: toolCall.call_id,
                        output: `Unknown tool: ${toolCall.name}`,
                    });
                }
            } catch (error) {
                console.error(`Tool execution failed: ${toolCall.name}`, error);

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output: "Tool execution failed.",
                });
            }
        }

        // Send the tool results back to the LLM
        response = await client.responses.create({
            model: "gpt-5.6",

            previous_response_id: response.id,

            input: toolOutputs,
        });
    }
}