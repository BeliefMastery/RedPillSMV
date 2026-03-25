import { getSuiteCompletion } from './suite-completion.js';

function genderBadge(gender) {
  if (!gender) return '';
  const symbol = gender === 'male' ? '♂' : '♀';
  const cls = gender === 'male' ? 'suite-gender-badge suite-gender-male' : 'suite-gender-badge suite-gender-female';
  const text = gender === 'male' ? 'male respondent' : 'female respondent';
  return `<span class="${cls}" aria-label="${text}">${symbol}</span>`;
}

function itemTemplate({ href, label, done, gender }) {
  const status = done ? 'Complete' : 'Not started';
  const icon = done ? '✓' : '○';
  const liClass = done ? 'suite-progress-item suite-progress-item--complete' : 'suite-progress-item';
  return `<li class="${liClass}" role="listitem">
    <span class="suite-progress-icon" aria-hidden="true">${icon}</span>
    <a class="suite-progress-link" href="${href}">${label}</a>
    <span class="suite-progress-status"><span class="visually-hidden">, </span>${status}</span>
    ${done ? genderBadge(gender) : ''}
  </li>`;
}

export function mountSuiteIndex() {
  const listEl = document.getElementById('suite-progress-list');
  const ctaEl = document.getElementById('suite-integrated-cta');
  const wrapEl = document.querySelector('.suite-progress-wrap');
  if (!listEl) return;

  const c = getSuiteCompletion();
  const items = [
    { href: 'archetype.html', label: 'Archetype', done: c.archetype, gender: c.genders.archetype },
    { href: 'attraction.html', label: 'Attraction', done: c.attraction, gender: c.genders.attraction },
    { href: 'temperament.html', label: 'Polarity', done: c.polarity, gender: c.genders.polarity }
  ];
  listEl.innerHTML = items.map(itemTemplate).join('');

  let mismatchEl = document.getElementById('suite-gender-mismatch');
  if (!mismatchEl && wrapEl) {
    mismatchEl = document.createElement('p');
    mismatchEl.id = 'suite-gender-mismatch';
    mismatchEl.className = 'suite-mismatch-note';
    wrapEl.appendChild(mismatchEl);
  }

  if (mismatchEl) {
    if (c.mismatch) {
      mismatchEl.innerHTML = 'Gender mismatch across completed assessments. Re-run the out-of-context result to generate a valid integrated map.';
      mismatchEl.hidden = false;
    } else {
      mismatchEl.hidden = true;
      mismatchEl.textContent = '';
    }
  }

  if (ctaEl) {
    if (c.allThree && c.sameRespondentGender) {
      ctaEl.hidden = false;
      ctaEl.removeAttribute('hidden');
    } else {
      ctaEl.hidden = true;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => mountSuiteIndex());
