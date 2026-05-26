/**
 * Shared tone/length helpers for archetype brutal narratives (archetype-engine + integrated-map).
 */

export function ensurePeriod(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function softenNarrativeTone(text) {
  if (!text) return '';
  return String(text)
    .replace(/\byou are\b/gi, 'you can be')
    .replace(/\byou will\b/gi, 'you may')
    .replace(/\byou do not\b/gi, 'you may not')
    .replace(/\byou don't\b/gi, 'you may not')
    .replace(/\byou never\b/gi, 'you can rarely')
    .replace(/\balways\b/gi, 'often')
    .replace(/\bnever\b/gi, 'rarely')
    .replace(/\bthe truth:\s*/gi, '');
}

export function summarizeBehavioralAccent(text, maxSentences = 2) {
  if (!text) return '';
  const clean = String(text).trim();
  if (!clean) return '';
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [];
  const selected = (sentences.length ? sentences : [clean])
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, maxSentences)
    .join(' ');
  return ensurePeriod(selected);
}
