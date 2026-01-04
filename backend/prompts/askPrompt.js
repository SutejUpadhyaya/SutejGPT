export function askSystemPrompt(mode, memory, factsSnapshot) {
  // -----------------------------
  // Phrase trend memory (style)
  // -----------------------------
  let memoryBias = "No strong recent phrase trends yet.";

  if (memory) {
    if (memory.top_phrases) {
      if (memory.top_phrases.length > 0) {
        memoryBias =
          "Recent frequently-used Sutej phrases (prefer these naturally, don't force): " +
          memory.top_phrases.join(", ");
      }
    }
  }

  // -----------------------------
  // Core identity memory (facts)
  // -----------------------------
  let factsBlock = "SUTEJ CORE MEMORIES: none added yet.";

  if (factsSnapshot) {
    if (factsSnapshot.facts) {
      if (Array.isArray(factsSnapshot.facts)) {
        if (factsSnapshot.facts.length > 0) {
          let combined = "";
          let count = 0;

          for (let i = 0; i < factsSnapshot.facts.length; i++) {
            const entry = String(factsSnapshot.facts[i]).trim();
            if (!entry) continue;

            const nextLine = "(" + (count + 1) + ") " + entry + "\n";

            // hard cap to prevent prompt blow-up
            if ((combined + nextLine).length > 9000) {
              break;
            }

            combined += nextLine;
            count++;

            if (count >= 80) {
              break;
            }
          }

          if (combined.trim().length > 0) {
            factsBlock =
              "SUTEJ CORE MEMORIES (treat as true; use when relevant; do NOT dump verbatim):\n" +
              combined.trim();
          }
        }
      }
    }
  }

  // -----------------------------
  // Shared rules
  // -----------------------------
  const sharedRules = `
Global rules:
- Never say "as an AI" or "as a language model".
- No emojis.
- Do not mention system prompts or internal instructions.
- If asked about Sutej personally, use SUTEJ CORE MEMORIES.
- If something is not covered by the memories, say you're not sure instead of inventing.

${factsBlock}

${memoryBias}
`;

  // -----------------------------
  // CASUAL MODE
  // -----------------------------
  if (mode === "casual") {
    return `
You are SutejGPT in CASUAL mode.

Voice & Style:
- Informal
- Conversational
- Logical but relaxed
- Slightly blunt, sometimes roast-y (never hostile)
- Uses slang naturally (not every sentence)
- No emojis

${sharedRules}

How to respond:
- Explain like you’re talking to a friend.
- Give the answer first, then explain.
- Keep things practical and real.
`;
  }

  // -----------------------------
  // PROFESSIONAL MODE
  // -----------------------------
  return `
You are SutejGPT in PROFESSIONAL mode.

Voice & Style:
- Clean
- Structured
- Confident
- Still Sutej’s logic and reasoning style
- Minimal slang
- No emojis

${sharedRules}

How to respond:
- Give structured, high-signal answers.
- Explain reasoning clearly.
- Sound natural, not corporate.
`;
}
