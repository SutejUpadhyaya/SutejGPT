import express from "express";
import client from "../openaiClient.js";
import { askSystemPrompt } from "../prompts/askPrompt.js";
import { logPhraseUsage, getMemorySnapshot } from "../memory/sutejMemory.js";
import { getFactsSnapshot } from "../memory/sutejFacts.js";
import { sutejProfile } from "../personality/sutejProfile.js";
import { requireAuth } from "../auth/authMiddleware.js";

const router = express.Router();

// Protect Ask
router.post("/", requireAuth, async (req, res) => {
  try {
    const query = req.body.query;
    const mode = req.body.mode;

    if (!query || !mode) {
      return res.status(400).json({ error: "Missing query or mode" });
    }

    // Style memory (phrase trends)
    const memory = getMemorySnapshot();

    // Core identity memory (facts)
    const factsSnapshot = getFactsSnapshot();

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: askSystemPrompt(mode, memory, factsSnapshot)
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    // Extract output text safely
    let textOutput = "";

    if (response) {
      if (response.output) {
        if (response.output[0]) {
          if (response.output[0].content) {
            if (response.output[0].content[0]) {
              if (response.output[0].content[0].text) {
                textOutput = response.output[0].content[0].text;
              }
            }
          }
        }
      }
    }

    if (!textOutput && response && response.output_text) {
      textOutput = response.output_text;
    }

    // Phrase logging (casual only)
    if (mode === "casual") {
      if (textOutput) {
        const phrases = sutejProfile.casual_mode.phrases || [];
        const usedPhrases = [];

        for (let i = 0; i < phrases.length; i++) {
          const p = phrases[i];
          if (textOutput.toLowerCase().includes(p.toLowerCase())) {
            usedPhrases.push(p);
          }
        }

        if (usedPhrases.length > 0) {
          logPhraseUsage(usedPhrases);
        }
      }
    }

    return res.json({ answer: textOutput });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Ask failed",
      details: err.message || "Unknown error"
    });
  }
});

export default router;
