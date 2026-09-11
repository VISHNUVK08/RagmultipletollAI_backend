import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function askLLM(message: string) {
    const response = await client.responses.create({
        model: "gpt-5.6",
        input: message,
    });

    return response.output_text;
}