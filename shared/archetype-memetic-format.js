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

/** @param {string[]} rawLines */
export function quotedMemeticLineList(rawLines) {
  const out = [];
  for (const line of rawLines) {
    const q = quotedMemeticSummary(line);
    if (q) out.push(q);
  }
  return out;
}

/**
 * @param {string[]} rawLines one or two memetic lines (unquoted)
 * @param {(s: string) => string} sanitizeHTML escape text for safe HTML body
 * @param {{ margin?: string, fontSize?: string }} style
 */
export function memeticSummaryBlockHtml(rawLines, sanitizeHTML, { margin = '0.15rem 0 0.9rem', fontSize = '1rem' } = {}) {
  const quoted = quotedMemeticLineList(rawLines);
  if (!quoted.length) return '';
  const style = `margin: ${margin}; color: var(--muted); font-size: ${fontSize}; font-style: italic;`;
  if (quoted.length === 1) {
    return `<p class="archetype-memetic-summary" style="${style}">${sanitizeHTML(quoted[0])}</p>`;
  }
  const spans = quoted
    .map((q, i) => {
      const active = i === 0 ? ' archetype-memetic-rotator__line--active' : '';
      return `<span class="archetype-memetic-rotator__line${active}" aria-hidden="${i !== 0}">${sanitizeHTML(q)}</span>`;
    })
    .join('');
  return `<p class="archetype-memetic-summary archetype-memetic-rotator" style="${style}">${spans}</p>`;
}
