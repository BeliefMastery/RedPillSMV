/**
 * Memetic summary display: quoted, italic via CSS class at call sites, first letter capitalized.
 */

export function normalizeMemeticSummary(text) {
  const t = String(text ?? '').trim();
  if (!t || t === '—') return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Returns `"Normalized text"` for UI, or empty string if no content. */
export function quotedMemeticSummary(text) {
  const n = normalizeMemeticSummary(text);
  if (!n || n === '—') return '';
  return `"${n}"`;
}
