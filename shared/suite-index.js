import { getSuiteCompletion } from './suite-completion.js';

function itemTemplate({ href, label, done }) {
  const status = done ? 'Complete' : 'Not started';
  const icon = done ? '✓' : '○';
  const liClass = done ? 'suite-progress-item suite-progress-item--complete' : 'suite-progress-item';
  return `<li class="${liClass}" role="listitem">
    <span class="suite-progress-icon" aria-hidden="true">${icon}</span>
    <a class="suite-progress-link" href="${href}">${label}</a>
    <span class="suite-progress-status"><span class="visually-hidden">, </span>${status}</span>
  </li>`;
}

export function mountSuiteIndex() {
  const listEl = document.getElementById('suite-progress-list');
  const ctaEl = document.getElementById('suite-integrated-cta');
  if (!listEl) return;

  const c = getSuiteCompletion();
  const items = [
    { href: 'archetype.html', label: 'Archetype', done: c.archetype },
    { href: 'attraction.html', label: 'Attraction', done: c.attraction },
    { href: 'temperament.html', label: 'Polarity', done: c.polarity }
  ];
  listEl.innerHTML = items.map(itemTemplate).join('');

  if (ctaEl) {
    if (c.allThree) {
      ctaEl.hidden = false;
      ctaEl.removeAttribute('hidden');
    } else {
      ctaEl.hidden = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => mountSuiteIndex());
