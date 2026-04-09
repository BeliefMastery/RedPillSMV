/** @type {WeakMap<Element, number>} */
const rotatorTimers = new WeakMap();

const INTERVAL_MS = 5000;

function stepRotator(root) {
  const lines = root.querySelectorAll(':scope > .archetype-memetic-rotator__line');
  if (lines.length < 2) return;
  let idx = -1;
  lines.forEach((el, i) => {
    if (el.classList.contains('archetype-memetic-rotator__line--active')) idx = i;
  });
  const next = idx < 0 ? 0 : (idx + 1) % lines.length;
  lines.forEach((el, i) => {
    const on = i === next;
    el.classList.toggle('archetype-memetic-rotator__line--active', on);
    el.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
}

/**
 * Start alternating memetic lines under `root` (document or container).
 * Clears previous timers for rotators inside `root` when re-run.
 */
export function initMemeticRotators(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('.archetype-memetic-rotator, .archetype-spread-memetic-cell--dual, .archetype-spread-popout__memetic-rotator').forEach((el) => {
    const prev = rotatorTimers.get(el);
    if (prev != null) window.clearInterval(prev);
    const lines = el.querySelectorAll(':scope > .archetype-memetic-rotator__line');
    if (lines.length < 2) return;
    lines.forEach((line, i) => {
      line.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    });
    const id = window.setInterval(() => stepRotator(el), INTERVAL_MS);
    rotatorTimers.set(el, id);
  });
}

export function destroyMemeticRotatorsIn(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('.archetype-memetic-rotator, .archetype-spread-memetic-cell--dual, .archetype-spread-popout__memetic-rotator').forEach((el) => {
    const prev = rotatorTimers.get(el);
    if (prev != null) window.clearInterval(prev);
    rotatorTimers.delete(el);
  });
}
