/**
 * Integrated map: synthesizes stored results from Archetype, Attraction, and Polarity.
 * Completion rules documented in shared/suite-completion.js
 */
import { getSuiteCompletion, getSuiteSnapshots } from './shared/suite-completion.js';
import {
  buildArchetypeLayer,
  buildPolarityLayer,
  buildAttractionLayer,
  buildCurrentPatternSummary,
  buildNextMoveCandidates,
  buildCrossIntegrationBullets
} from './shared/integrated-map-excerpts.js';

function esc(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function genderBadge(gender) {
  if (!gender) return '';
  const symbol = gender === 'male' ? '♂' : '♀';
  const cls = gender === 'male' ? 'suite-gender-badge suite-gender-male' : 'suite-gender-badge suite-gender-female';
  const text = gender === 'male' ? 'male respondent' : 'female respondent';
  return `<span class="${cls}" aria-label="${text}">${symbol}</span>`;
}

function gateListItem(href, label, done, gender) {
  const status = done ? 'Complete' : 'Not started';
  const icon = done ? '✓' : '○';
  const cls = done ? 'suite-progress-item suite-progress-item--complete' : 'suite-progress-item';
  return `<li class="${cls}" role="listitem"><span class="suite-progress-icon" aria-hidden="true">${icon}</span><a class="suite-progress-link" href="${href}">${esc(label)}</a><span class="suite-progress-status"> — ${status}</span>${done ? genderBadge(gender) : ''}</li>`;
}

function renderGate(c) {
  const mismatchNote = c.mismatch
    ? `<p class="suite-mismatch-note" style="margin-top:0.75rem;">Gender mismatch across completed assessments. Integrated map requires all three completions to be from the same respondent gender.</p>`
    : '';
  return `
    <div class="integrated-map-gate">
      <h1 class="section-title-btn" style="margin-bottom:0.75rem;">Integrated map</h1>
      <p style="color:var(--muted);max-width:26rem;margin:0 auto;line-height:1.55;">Complete Archetype, Attraction, and Polarity on this device with the same respondent gender to unlock a combined read.</p>
      <ul class="suite-progress-list" role="list" aria-label="Completion status">
        ${gateListItem('archetype.html', 'Archetype', c.archetype, c.genders?.archetype)}
        ${gateListItem('attraction.html', 'Attraction', c.attraction, c.genders?.attraction)}
        ${gateListItem('temperament.html', 'Polarity', c.polarity, c.genders?.polarity)}
      </ul>
      ${mismatchNote}
      <p style="margin-top:1.25rem;"><a href="index.html">Back to home</a></p>
    </div>`;
}

function renderLayer(layer) {
  const subtitle = layer.subtitle ? `<p class="integrated-map-layer-subtitle">${esc(layer.subtitle)}</p>` : '';
  const frame = layer.frame || { meaning: '', helps: '', costs: '' };
  const meaning = frame.meaning
    ? `<h3 class="integrated-map-subhead">What it means</h3><p class="integrated-map-layer-intro">${esc(frame.meaning)}</p>`
    : '';
  const helps = frame.helps
    ? `<h3 class="integrated-map-subhead">Where it helps</h3><p class="integrated-map-layer-intro">${esc(frame.helps)}</p>`
    : '';
  const costs = frame.costs
    ? `<h3 class="integrated-map-subhead">Where it costs</h3><p class="integrated-map-layer-intro">${esc(frame.costs)}</p>`
    : '';

  return `
    <section class="integrated-map-layer">
      <h2 class="integrated-map-layer-title">${esc(layer.title)}</h2>
      ${subtitle}
      ${meaning}
      ${helps}
      ${costs}
      <a class="integrated-map-more" href="${esc(layer.href)}">${esc(layer.hrefLabel)}</a>
    </section>`;
}

function renderCurrentPatternSummary(summary) {
  if (!summary) return '';
  return `
    <section class="integrated-map-current-pattern" aria-labelledby="integrated-current-pattern-heading">
      <h2 id="integrated-current-pattern-heading" class="integrated-map-frame-heading">Your Current Pattern (Summary)</h2>
      <p>${esc(summary)}</p>
    </section>`;
}

function renderNextMove(nextMoves) {
  const moves = Array.isArray(nextMoves) ? nextMoves.filter(Boolean).slice(0, 3) : [];
  if (!moves.length) return '';
  return `
    <section class="integrated-map-next-move" aria-labelledby="integrated-next-move-heading">
      <h2 id="integrated-next-move-heading" class="integrated-map-frame-heading">Your Next Move (Priority)</h2>
      <ul class="integrated-map-next-move-list">
        ${moves.map((m) => `<li>${esc(m)}</li>`).join('')}
      </ul>
      <p style="margin-top:0.75rem;color:var(--muted);font-size:0.9rem;line-height:1.45;">Pick one move, run it for a short cycle, and re-test later.</p>
    </section>`;
}

function renderContent(snapshots) {
  const a = snapshots.archetype;
  const t = snapshots.polarity;
  const r = snapshots.attraction;
  const archL = buildArchetypeLayer(a?.analysisData || {});
  const polL = buildPolarityLayer(t?.analysisData || {});
  const attL = buildAttractionLayer(r || {});

  const summary = buildCurrentPatternSummary(a, t, r);
  const nextMoves = buildNextMoveCandidates(a, t, r);

  const layers = `
    <div class="integrated-map-layers">
      ${renderLayer(archL)}
      ${renderLayer(polL)}
      ${renderLayer(attL)}
    </div>`;

  const crossItems = buildCrossIntegrationBullets(archL, polL, attL)
    .map((x) => `<li>${esc(x)}</li>`)
    .join('');
  const cross = `
    <section class="integrated-map-cross" aria-labelledby="integrated-cross-heading">
      <h2 id="integrated-cross-heading">How these layers meet</h2>
      <ul>${crossItems}</ul>
    </section>`;

  return `
    <h1 class="section-title-btn" style="text-align:center;margin-bottom:0.5rem;">Integrated map</h1>
    ${renderCurrentPatternSummary(summary)}
    ${layers}
    ${renderNextMove(nextMoves)}
    ${cross}
    <p style="text-align:center;margin-top:1.5rem;color:var(--muted);font-size:0.9rem;"><a href="index.html">Home</a> · <a href="relationship.html">Relationships</a> (separate lens)</p>`;
}

function mount() {
  const root = document.getElementById('integrated-root');
  if (!root) return;

  const c = getSuiteCompletion();
  if (!c.allThree || !c.sameRespondentGender) {
    root.innerHTML = renderGate(c);
    return;
  }

  const snapshots = getSuiteSnapshots();
  if (!snapshots.archetype || !snapshots.polarity || !snapshots.attraction) {
    root.innerHTML = renderGate(getSuiteCompletion());
    return;
  }

  root.innerHTML = renderContent(snapshots);
}

document.addEventListener('DOMContentLoaded', mount);
