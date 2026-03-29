/**
 * Unified gender marker for assessment reports: ♂ / ♀ beneath the main title.
 * @param {string|null|undefined} gender - 'male' | 'female' | 'man' | 'woman'
 * @returns {string} HTML snippet (empty if unknown)
 */
export function reportGenderGlyphHtml(gender) {
  const g = String(gender ?? '').toLowerCase();
  const isMale = g === 'male' || g === 'man';
  const isFemale = g === 'female' || g === 'woman';
  if (isMale) {
    return '<p class="assessment-report-gender-glyph assessment-report-gender-glyph--male" aria-label="Male respondent">♂</p>';
  }
  if (isFemale) {
    return '<p class="assessment-report-gender-glyph assessment-report-gender-glyph--female" aria-label="Female respondent">♀</p>';
  }
  return '';
}
