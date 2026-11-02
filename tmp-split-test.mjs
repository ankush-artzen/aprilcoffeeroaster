const LONG_PROSE_CHAR_THRESHOLD = 280;
const SENTENCES_PER_PARAGRAPH = 2;

function normalizeSentenceSpacing(text) {
  return text.replace(/([a-z0-9])\.([A-Z])/g, "$1. $2");
}

function splitIntoSentences(text) {
  const normalized = normalizeSentenceSpacing(text).trim();
  if (!normalized) return [];
  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLongProseBlock(text) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.includes("\n") || trimmed.includes("•")) return null;
  if (trimmed.length < LONG_PROSE_CHAR_THRESHOLD) return null;
  const sentences = splitIntoSentences(trimmed);
  if (sentences.length < 2) return null;
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARAGRAPH) {
    paragraphs.push(sentences.slice(i, i + SENTENCES_PER_PARAGRAPH).join(" "));
  }
  return paragraphs.length > 1 ? paragraphs : null;
}

const value =
  "Volcan Azul is a truly remarkable coffee estate located in the Alajuela region of Costa Rica and overseen by Don Alejo Castro. The fifth generation of his family to tend to the land, Alejo is an incredibly knowledgeable farmer, and the estate has a rich history which can be clearly traced back to the late 19th century.The farm produces a vast variety of cultivars and varietals, such as Catuai, Caturra, Obata, SL28 and Geisha. Alejo continues to propagate new varietals every season, with the objective to continuously experiment and add diversity to his harvest. This lot has been grown on the slopes surrounding F.C.J Volcan Azul on a plot named Cardamomo. The cherries are pulped against a centrifuge, before a mechanical washed removes any remaining mucilage from the bean. The drying is undertaken on patios for between 6-10 days depending on the environmental conditions on the farm. The milling is undertaken on site at Alejo's own dry mill before being vacuum packed for shipping.";

const result = splitLongProseBlock(value);
console.log(JSON.stringify(result, null, 2));
console.log("count", result?.length);
