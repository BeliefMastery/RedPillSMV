import { getSuiteCompletion } from './suite-completion.js';

/** Commit swipe if finger moved at least this far horizontally. */
const SWIPE_COMMIT_PX = 56;
/** Movement before we decide horizontal vs vertical. */
const DIRECTION_LOCK_PX = 14;
/** If vertical movement dominates by this ratio, cancel and let the page scroll. */
const VERTICAL_DOMINANCE = 1.12;

const BASE_PAGES = [
  'index.html',
  'archetype.html',
  'temperament.html',
  'attraction.html',
  'relationship.html'
];

function currentFile() {
  const parts = (window.location.pathname || '').split('/').filter(Boolean);
  const file = (parts.pop() || 'index.html').toLowerCase();
  return file || 'index.html';
}

function shouldIgnoreSwipeTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return true;
  return false;
}

/** Avoid stealing horizontal scroll from carousels / wide tables. */
function isInHorizontallyScrollable(el) {
  let n = el;
  for (let i = 0; n && n !== document.body && i < 24; i++, n = n.parentElement) {
    try {
      const s = getComputedStyle(n);
      if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 4) {
        return true;
      }
    } catch {
      break;
    }
  }
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

/** direction: 'left' = user swiped left (finger moved left) → next page in cycle */
function getTargetForSwipeDirection(direction) {
  const pages = getSwipeCyclePages();
  const file = currentFile();
  const currentIndex = pages.indexOf(file);
  const index = currentIndex >= 0 ? currentIndex : 0;
  const delta = direction === 'left' ? 1 : -1;
  const nextIndex = (index + delta + pages.length) % pages.length;
  return pages[nextIndex];
}

function clearBodyTransform() {
  document.body.style.transition = '';
  document.body.style.transform = '';
  document.body.style.willChange = '';
}

function navigateInstant(direction) {
  const target =
    direction === 'left' ? getTargetForSwipeDirection('left') : getTargetForSwipeDirection('right');
  const file = currentFile();
  if (!target || target === file) return;
  window.location.href = target;
}

/** No animation: same thresholds, instant navigation (prefers-reduced-motion). */
function initSwipeNavReducedMotion() {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  document.addEventListener(
    'touchstart',
    (ev) => {
      if (!ev.changedTouches || ev.changedTouches.length !== 1) return;
      if (shouldIgnoreSwipeTarget(ev.target) || isInHorizontallyScrollable(ev.target)) {
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
      if (Math.abs(dx) < SWIPE_COMMIT_PX) return;
      if (Math.abs(dy) * VERTICAL_DOMINANCE > Math.abs(dx)) return;
      navigateInstant(dx < 0 ? 'left' : 'right');
    },
    { passive: true }
  );
}

/**
 * Full-page slide: body follows finger, then animates off-screen before navigation.
 */
export function initSwipeNav() {
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initSwipeNavReducedMotion();
    return;
  }

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let locked = false;
  let touchId = null;

  const applyDrag = (dx) => {
    document.body.style.willChange = 'transform';
    document.body.style.transform = `translate3d(${dx}px, 0, 0)`;
  };

  document.addEventListener(
    'touchstart',
    (ev) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      if (shouldIgnoreSwipeTarget(ev.target) || isInHorizontallyScrollable(ev.target)) {
        tracking = false;
        return;
      }
      const t = ev.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      touchId = t.identifier;
      tracking = true;
      locked = false;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchmove',
    (ev) => {
      if (!tracking || !ev.touches || ev.touches.length !== 1) return;
      const t = Array.from(ev.touches).find((x) => x.identifier === touchId) ?? ev.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (!locked) {
        if (Math.abs(dx) < DIRECTION_LOCK_PX && Math.abs(dy) < DIRECTION_LOCK_PX) return;
        if (Math.abs(dy) * VERTICAL_DOMINANCE > Math.abs(dx)) {
          tracking = false;
          clearBodyTransform();
          return;
        }
        locked = true;
        document.body.style.transition = 'none';
      }

      ev.preventDefault();
      applyDrag(dx);
    },
    { passive: false }
  );

  const finish = (ev) => {
    if (!tracking) return;
    const t =
      ev.changedTouches &&
      (Array.from(ev.changedTouches).find((x) => x.identifier === touchId) || ev.changedTouches[0]);
    tracking = false;
    touchId = null;

    if (!locked) {
      clearBodyTransform();
      return;
    }
    locked = false;

    const dx = t ? t.clientX - startX : 0;
    const vw = window.innerWidth || document.documentElement.clientWidth || 320;

    const goNext = dx < -SWIPE_COMMIT_PX;
    const goPrev = dx > SWIPE_COMMIT_PX;

    const springBack = () => {
      document.body.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.transform = 'translate3d(0, 0, 0)';
      const onEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        document.body.removeEventListener('transitionend', onEnd);
        clearBodyTransform();
      };
      document.body.addEventListener('transitionend', onEnd);
      window.setTimeout(() => clearBodyTransform(), 380);
    };

    if (!goNext && !goPrev) {
      springBack();
      return;
    }

    const direction = goNext ? 'left' : 'right';
    const target = getTargetForSwipeDirection(direction);
    const file = currentFile();
    if (!target || target === file) {
      springBack();
      return;
    }

    const outX = goNext ? -vw : vw;
    document.body.style.transition = 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)';
    document.body.style.transform = `translate3d(${outX}px, 0, 0)`;

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.location.href = target;
    };

    const onEnd = (e) => {
      if (e.propertyName !== 'transform') return;
      document.body.removeEventListener('transitionend', onEnd);
      go();
    };
    document.body.addEventListener('transitionend', onEnd);
    window.setTimeout(go, 420);
  };

  document.addEventListener('touchend', finish, { passive: true });
  document.addEventListener('touchcancel', finish, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSwipeNav());
} else {
  initSwipeNav();
}
