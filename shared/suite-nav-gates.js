/**
 * Marks suite nav links (header + bottom nav + home grid) when stage prerequisites are missing.
 * Sample-report-only access: does not apply to inline body copy links.
 * @see getStageGateState in suite-completion.js
 */
import { getStageGateState } from './suite-completion.js';

function normalizeHref(href) {
  if (!href || typeof href !== 'string') return '';
  try {
    const u = new URL(href, window.location.href);
    const path = u.pathname || '';
    const seg = path.split('/').pop() || '';
    return seg.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Nav scope only — avoids locking "Explore further" links inside article copy.
 */
function collectGateLinks() {
  const sel = [
    'header.site-header nav a[href]',
    'nav.bottom-nav a[href]',
    '.home-image-grid a[href]'
  ].join(', ');
  return Array.from(document.querySelectorAll(sel));
}

/**
 * Visual lock + prerequisite copy beside #startAssessment on Polarity / Attraction when gated.
 * Click still reaches the engine handler, which shows the same message in a modal.
 */
export function applySuiteStartGateHints() {
  if (document.getElementById('suiteStartPrereqHint')) return;

  const g = getStageGateState();
  const start = document.getElementById('startAssessment');
  if (!start) return;

  const path = (window.location.pathname || '').split('/').pop() || '';
  let locked = false;
  let msg = '';
  if (path === 'temperament.html' && !g.polarityUnlocked) {
    locked = true;
    msg = g.polarityBlockMessage;
  } else if (path === 'attraction.html' && !g.attractionUnlocked) {
    locked = true;
    msg = g.attractionBlockMessage;
  }
  if (!locked || !msg) return;

  start.classList.add('suite-start-locked');
  start.setAttribute('aria-disabled', 'true');
  start.setAttribute('aria-describedby', 'suiteStartPrereqHint');

  const wrap = start.closest('.action-buttons');
  if (!wrap) return;

  const hint = document.createElement('p');
  hint.className = 'suite-start-prereq-hint';
  hint.id = 'suiteStartPrereqHint';
  hint.setAttribute('role', 'status');
  const icon = document.createElement('span');
  icon.className = 'suite-start-prereq-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17a2 2 0 1 0 .001 0H12zm6-6V9a6 6 0 1 0-12 0v2H4v10h16V11h-2zM8 9a4 4 0 0 1 8 0v2H8V9z"/></svg>';
  const text = document.createElement('span');
  text.className = 'suite-start-prereq-text';
  text.textContent = msg;
  hint.appendChild(icon);
  hint.appendChild(text);
  wrap.appendChild(hint);
}

export function initSuiteNavGates() {
  const g = getStageGateState();

  collectGateLinks().forEach((a) => {
    const file = normalizeHref(a.getAttribute('href'));
    if (file !== 'temperament.html' && file !== 'attraction.html') return;

    const locked =
      file === 'temperament.html' ? !g.polarityUnlocked : !g.attractionUnlocked;
    if (!locked) {
      a.classList.remove('suite-nav-locked');
      a.removeAttribute('data-suite-locked');
      a.removeAttribute('title');
      return;
    }

    a.classList.add('suite-nav-locked');
    a.setAttribute('data-suite-locked', 'true');
    const msg =
      file === 'temperament.html' ? g.polarityBlockMessage : g.attractionBlockMessage;
    a.setAttribute('title', msg);
  });

  applySuiteStartGateHints();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSuiteNavGates());
} else {
  initSuiteNavGates();
}
