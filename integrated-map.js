/**
 * Integrated map: synthesizes stored results from Archetype, Attraction, and Polarity.
 * Completion rules documented in shared/suite-completion.js
 */
import { getSuiteCompletion, getSuiteSnapshots } from './shared/suite-completion.js';
import {
  buildArchetypeLayer,
  buildPolarityLayer,
  buildAttractionLayer,
  buildHeroFragments,
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

function gateListItem(href, label, done) {
  const status = done ? 'Complete' : 'Not started';
  const icon = done ? '✓' : '○';
  const cls = done ? 'suite-progress-item suite-progress-item--complete' : 'suite-progress-item';
  return `<li class="${cls}" role="listitem"><span class="suite-progress-icon" aria-hidden="true">${icon}</span><a class="suite-progress-link" href="${href}">${esc(label)}</a><span class="suite-progress-status"> — ${status}</span></li>`;
}

function renderGate(c) {
  return `
    <div class="integrated-map-gate">
      <h1 class="section-title-btn" style="margin-bottom:0.75rem;">Integrated map</h1>
      <p style="color:var(--muted);max-width:26rem;margin:0 auto;line-height:1.55;">Complete all three self-assessments on this device to unlock a combined read. Progress is stored locally only.</p>
      <ul class="suite-progress-list" role="list" aria-label="Completion status">
        ${gateListItem('archetype.html', 'Archetype', c.archetype)}
        ${gateListItem('attraction.html', 'Attraction', c.attraction)}
        ${gateListItem('temperament.html', 'Polarity', c.polarity)}
      </ul>
      <p style="margin-top:1.25rem;"><a href="index.html">Back to home</a></p>
    </div>`;
}

function renderLayer(layer) {
  const subtitle = layer.subtitle
    ? `<p class="integrated-map-layer-subtitle">${esc(layer.subtitle)}</p>`
    : '';
  const hasQualities = layer.qualities?.intro || (layer.qualities?.bullets || []).length;
  const qualitiesBlock = hasQualities
    ? `<h3 class="integrated-map-subhead">Essential qualities</h3>${layer.qualities?.intro ? `<p class="integrated-map-layer-intro">${esc(layer.qualities.intro)}</p>` : ''}${(layer.qualities?.bullets || []).length ? `<ul class="integrated-map-layer-list">${(layer.qualities.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`
    : '';
  const narrative = layer.narrative
    ? `<p class="integrated-map-layer-narrative"><strong>Deeper pattern (excerpt):</strong> ${esc(layer.narrative)}</p>`
    : '';
  const cList = (layer.concerns?.bullets || []).length
    ? `<h3 class="integrated-map-subhead">Concerns / friction</h3><ul class="integrated-map-layer-list">${(layer.concerns.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '';
  const oList = (layer.orientation?.bullets || []).length
    ? `<h3 class="integrated-map-subhead">Orientation / advice</h3><ul class="integrated-map-layer-list">${(layer.orientation.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '';

  return `
    <section class="integrated-map-layer">
      <h2 class="integrated-map-layer-title">${esc(layer.title)}</h2>
      ${subtitle}
      ${qualitiesBlock}
      ${narrative}
      ${cList}
      ${oList}
      <a class="integrated-map-more" href="${esc(layer.href)}">${esc(layer.hrefLabel)}</a>
    </section>`;
}

function renderHero(archetypeSnap, polaritySnap, attractionSnap) {
  const h = buildHeroFragments(archetypeSnap, polaritySnap, attractionSnap);
  const band = h.marketBand
    ? ` Segment band: <strong>${esc(h.marketBand)}</strong>.`
    : '';
  const path =
    h.assessmentGender === 'male' || h.assessmentGender === 'female'
      ? ` (${h.assessmentGender === 'male' ? 'male' : 'female'} SMV assessment path).`
      : '';
  const p1 = `Unplugged <strong>integrated map</strong>${path} — three red-pill lenses: <strong>${esc(h.primaryName)}</strong> as your <strong>red-pill archetype</strong> lead; <strong>${esc(h.polarityExplicit)}</strong>; and <strong>Sexual Market Value — ${esc(h.smvHeadline)}</strong>.${band} Use these to inform choices and calibration, not to freeze identity.`;
  const p2 = 'Each card mirrors the language of the full tool reports (qualities, friction, orientation). Open the assessments for evidence, charts, and caveats.';

  return `<div class="integrated-map-hero"><p>${p1}</p><p>${p2}</p></div>`;
}

function renderContent(snapshots) {
  const a = snapshots.archetype;
  const t = snapshots.polarity;
  const r = snapshots.attraction;
  const ad = a?.analysisData;
  const pd = t?.analysisData;

  const archL = buildArchetypeLayer(ad || {});
  const polL = buildPolarityLayer(pd || {});
  const attL = buildAttractionLayer(r || {});

  const hero = renderHero(a, t, r);
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
    ${hero}
    ${layers}
    ${cross}
    <p style="text-align:center;margin-top:1.5rem;color:var(--muted);font-size:0.9rem;"><a href="index.html">Home</a> · <a href="relationship.html">Relationships</a> (separate lens)</p>`;
}

function mount() {
  const root = document.getElementById('integrated-root');
  if (!root) return;

  const c = getSuiteCompletion();
  if (!c.allThree) {
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
