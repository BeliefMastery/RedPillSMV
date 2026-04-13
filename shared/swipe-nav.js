import { getSuiteCompletion } from './suite-completion.js';

const SWIPE_THRESHOLD_PX = 60;
const MAX_VERTICAL_DRIFT_PX = 80;

const BASE_PAGES = [
  'index.html',
  'archetype.html',
  'temperament.html',
  'attraction.html',
  'relationship.html'
];

function currentFile() {
  const parts = (window.location.pathname || '').split('/');
  const file = (parts.pop() || 'index.html').toLowerCase();
  return file || 'index.html';
}

function shouldIgnoreSwipeTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return true;
  return false;
}

function getSwipeCyclePages() {
  const completion = getSuiteCompletion();
  const pages = [...BASE_PAGES];
  if (completion.allThree && completion.sameRespondentGender) {
    pages.push('integrated-map.html');
  }
  return pages;
}

function navigateBySwipe(direction) {
  const pages = getSwipeCyclePages();
  if (!pages.length) return;

  const file = currentFile();
  const currentIndex = pages.indexOf(file);
  const index = currentIndex >= 0 ? currentIndex : 0;
  const delta = direction === 'left' ? 1 : -1;
  const nextIndex = (index + delta + pages.length) % pages.length;
  const nextFile = pages[nextIndex];
  if (!nextFile || nextFile === file) return;
  window.location.href = nextFile;
}

export function initSwipeNav() {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  document.addEventListener(
    'touchstart',
    (ev) => {
      if (!ev.changedTouches || ev.changedTouches.length !== 1) return;
      if (shouldIgnoreSwipeTarget(ev.target)) {
        tracking = false;
        return;
      }
      const t = ev.changedTouches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    (ev) => {
      if (!tracking || !ev.changedTouches || ev.changedTouches.length !== 1) return;
      tracking = false;
      const t = ev.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dy) > MAX_VERTICAL_DRIFT_PX) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      navigateBySwipe(dx < 0 ? 'left' : 'right');
    },
    { passive: true }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSwipeNav());
} else {
  initSwipeNav();
}
