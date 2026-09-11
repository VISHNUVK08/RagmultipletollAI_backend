export function calculator(expression: string): number {
    // Simple demo calculator.
    // We will make this safer later.

    const result = Function(`"use strict"; return (${expression})`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}