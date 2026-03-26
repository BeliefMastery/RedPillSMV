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
  buildPatternConvergenceParagraph
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
  const renderBullets = (bullets) => {
    if (!Array.isArray(bullets) || !bullets.length) return '';
    const items = bullets.map((b) => `<li>${esc(b)}</li>`).join('');
    return `<ul class="integrated-map-layer-list">${items}</ul>`;
  };

  const isArchetype = layer.href === 'archetype.html' || String(layer.title || '').includes('Red-Pill Archetype');
  const isPolarity = layer.href === 'temperament.html' || String(layer.title || '').includes('Temperament');
  const isSmv = layer.href === 'attraction.html' || String(layer.title || '').includes('Sexual Market Value');

  const meaningTitle = isArchetype ? 'Character implications' : isSmv ? 'Your value' : 'What it means';
  const helpsTitle = isArchetype ? 'Strengths' : isSmv ? 'Your options' : 'Where it helps';
  const costsTitle = isArchetype ? 'Weaknesses' : isSmv ? 'Your issues' : 'Where it costs';

  const suppressMeaning = isArchetype || isPolarity || isSmv;
  const meaningLead = frame.meaning ? frame.meaning : '';
  const meaningBullets = renderBullets(frame.meaningBullets);
  const meaning = suppressMeaning
    ? ''
    : (meaningLead || meaningBullets
      ? `<h3 class="integrated-map-subhead">${esc(meaningTitle)}</h3>${
          meaningLead ? `<p class="integrated-map-layer-intro">${esc(meaningLead)}</p>` : ''
        }${meaningBullets}`
      : '');

  const helpsLead = frame.helps ? frame.helps : '';
  const helpsBullets = renderBullets(frame.helpsBullets);
  const helps = helpsLead || helpsBullets
    ? `<h3 class="integrated-map-subhead">${esc(helpsTitle)}</h3>${
        helpsLead ? `<p class="integrated-map-layer-intro">${esc(helpsLead)}</p>` : ''
      }${helpsBullets}`
    : '';

  const costsLead = frame.costs ? frame.costs : '';
  const costsBullets = renderBullets(frame.costsBullets);
  const costs = costsLead || costsBullets
    ? `<h3 class="integrated-map-subhead">${esc(costsTitle)}</h3>${
        costsLead ? `<p class="integrated-map-layer-intro">${esc(costsLead)}</p>` : ''
      }${costsBullets}`
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
  const identity = typeof summary === 'object' ? summary.identity : String(summary || '');
  const market = typeof summary === 'object' ? summary.market : '';
  return `
    <section class="integrated-map-current-pattern" aria-labelledby="integrated-current-pattern-heading">
      <h2 id="integrated-current-pattern-heading" class="integrated-map-frame-heading">Your Current Pattern (Summary)</h2>
      ${identity ? `<p><strong>Identity Pattern:</strong> ${esc(identity)}</p>` : ''}
      ${market ? `<p><strong>Market Read:</strong> ${esc(market)}</p>` : ''}
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
  const layerBundle = { archL, polL, attL };
  const nextMoves = buildNextMoveCandidates(a, t, r, { layers: layerBundle });

  const layers = `
    <div class="integrated-map-layers">
      ${renderLayer(archL)}
      ${renderLayer(polL)}
      ${renderLayer(attL)}
    </div>`;

  const convergence = buildPatternConvergenceParagraph(a, t, r, { layers: layerBundle });
  const cross = `
    <section class="integrated-map-cross" aria-labelledby="integrated-cross-heading">
      <h2 id="integrated-cross-heading">Pattern Convergence</h2>
      <p class="integrated-map-cross-paragraph">${esc(convergence)}</p>
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
