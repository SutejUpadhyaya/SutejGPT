import fs from "fs";
import path from "path";

const FACTS_PATH = path.join(process.cwd(), "memory", "sutejFacts.json");

function ensureFactsFile() {
  if (!fs.existsSync(FACTS_PATH)) {
    const initial = { version: 1, updatedAt: "", facts: [] };
    fs.writeFileSync(FACTS_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export function getFactsSnapshot() {
  try {
    ensureFactsFile();
    const raw = fs.readFileSync(FACTS_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    return {
      version: parsed.version || 1,
      updatedAt: parsed.updatedAt || "",
      facts: Array.isArray(parsed.facts) ? parsed.facts : []
    };
  } catch {
    return { version: 1, updatedAt: "", facts: [] };
  }
}

export function setFacts(nextFacts) {
  ensureFactsFile();

  const cleaned = (Array.isArray(nextFacts) ? nextFacts : [])
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, 100); // prevent huge prompts

  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    facts: cleaned
  };

  fs.writeFileSync(FACTS_PATH, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export function addFact(fact) {
  const snapshot = getFactsSnapshot();
  const f = String(fact || "").trim();
  if (!f) return snapshot;

  const facts = snapshot.facts.includes(f) ? snapshot.facts : [f, ...snapshot.facts];
  return setFacts(facts);
}

export function removeFact(fact) {
  const snapshot = getFactsSnapshot();
  const f = String(fact || "").trim();
  const facts = snapshot.facts.filter((x) => x !== f);
  return setFacts(facts);
}
