import OpenAI from "openai";
import { calculator } from "../tools/calculator.tool.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function askLLM(message: string) {
    const response = await client.responses.create({
        model: "gpt-5.6",

        input: message,

        tools: [
            {
                type: "function",
                strict: true,
                name: "calculator",
                description:
                    "Calculate a mathematical expression and return the numeric result.",
                parameters: {
                    type: "object",
                    properties: {
                        expression: {
                            type: "string",
                            description: "The mathematical expression to calculate.",
                        },
                    },
                    required: ["expression"],
                    additionalProperties: false,
                },
            },
        ],
    });

    return response.output_text;
}