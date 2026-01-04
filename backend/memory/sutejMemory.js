import fs from "fs";
import path from "path";

const MEMORY_PATH = path.resolve(process.cwd(), "memory", "sutejMemory.json");

function loadMemory() {
  if (!fs.existsSync(MEMORY_PATH)) {
    return {
      phrase_usage: {},
      blunt_usage: {},
      last_updated: null
    };
  }
  return JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

export function logPhraseUsage(phrasesUsed = []) {
  const memory = loadMemory();

  phrasesUsed.forEach(p => {
    memory.phrase_usage[p] = (memory.phrase_usage[p] || 0) + 1;
  });

  memory.last_updated = new Date().toISOString();
  saveMemory(memory);
}

export function getMemorySnapshot() {
  const memory = loadMemory();

  const phraseUsage = memory.phrase_usage || {};
  const topPhrases = Object.entries(phraseUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);

  return {
    top_phrases: topPhrases,
    last_updated: memory.last_updated || null
  };
}