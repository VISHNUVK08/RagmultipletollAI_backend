import { Router } from "express";

import { runAgent } from "../agent/agent.service.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required",
            });
        }

        const answer = await runAgent(message);

        return res.json({
            answer,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Something went wrong",
        });
    }
});

export default router;