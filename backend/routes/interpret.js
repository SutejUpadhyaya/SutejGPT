import express from "express";
import client from "../openaiClient.js";
import { interpreterSystemPrompt } from "../prompts/interpreterPrompt.js";
import { requireAuth } from "../auth/authMiddleware.js";

const router = express.Router();

// Protect Interpret
router.post("/", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Missing required field: text"
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: interpreterSystemPrompt
        },
        {
          role: "user",
          content: `message_from_sutej: ${text}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "sutej_interpretation",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              intent: { type: "string" },
              tone: { type: "string" },
              ask_from_recipient: { type: "string" },
              misinterpretation_risks: {
                type: "array",
                items: { type: "string" }
              },
              suggested_replies: {
                type: "array",
                items: { type: "string" }
              },
              rewrites: {
                type: "object",
                additionalProperties: false,
                properties: {
                  clearer: { type: "string" },
                  more_direct: { type: "string" },
                  more_professional: { type: "string" }
                },
                required: ["clearer", "more_direct", "more_professional"]
              }
            },
            required: [
              "summary",
              "intent",
              "tone",
              "ask_from_recipient",
              "misinterpretation_risks",
              "suggested_replies",
              "rewrites"
            ]
          }
        }
      }
    });

    // Extract output text safely
    let textOutput = "";

    if (
      response &&
      response.output &&
      response.output[0] &&
      response.output[0].content &&
      response.output[0].content[0] &&
      response.output[0].content[0].text
    ) {
      textOutput = response.output[0].content[0].text;
    } else if (response && response.output_text) {
      textOutput = response.output_text;
    }

    if (textOutput) {
      try {
        return res.json(JSON.parse(textOutput));
      } catch (err) {
        return res.json({ raw: textOutput });
      }
    }

    return res.status(500).json({
      error: "No output returned from model"
    });
  } catch (err) {
    console.error("OPENAI ERROR:");
    console.error(err);

    return res.status(500).json({
      error: "Interpreter failed",
      details: err.message || "Unknown error"
    });
  }
});

export default router;
