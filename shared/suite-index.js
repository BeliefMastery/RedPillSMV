import { getSuiteCompletion, getStageGateState } from './suite-completion.js';

function genderBadge(gender) {
  if (!gender) return '';
  const symbol = gender === 'male' ? '♂' : '♀';
  const cls = gender === 'male' ? 'suite-gender-badge suite-gender-male' : 'suite-gender-badge suite-gender-female';
  const text = gender === 'male' ? 'male respondent' : 'female respondent';
  return `<span class="${cls}" aria-label="${text}">${symbol}</span>`;
}

function itemTemplate({ href, label, done, gender, locked, lockHint }) {
  let status = done ? 'Complete' : 'Not started';
  if (locked) status = `Locked — ${lockHint || 'complete prior steps'}`;
  const icon = done ? '✓' : locked ? '🔒' : '○';
  const liClass = done
    ? 'suite-progress-item suite-progress-item--complete'
    : locked
      ? 'suite-progress-item suite-progress-item--locked'
      : 'suite-progress-item';
  const safeHint = String(lockHint || '').replace(/"/g, '&quot;');
  const linkOrSpan = locked
    ? `<span class="suite-progress-link suite-progress-link--locked" title="${safeHint}">${label}</span>`
    : `<a class="suite-progress-link" href="${href}">${label}</a>`;
  return `<li class="${liClass}" role="listitem">
    <span class="suite-progress-icon" aria-hidden="true">${icon}</span>
    ${linkOrSpan}
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
  const g = getStageGateState();
  const items = [
    { href: 'archetype.html', label: 'Archetype', done: c.archetype, gender: c.genders.archetype, locked: false },
    {
      href: 'temperament.html',
      label: 'Polarity',
      done: c.polarity,
      gender: c.genders.polarity,
      locked: !g.polarityUnlocked && !c.polarity,
      lockHint: g.polarityBlockMessage
    },
    {
      href: 'attraction.html',
      label: 'Attraction',
      done: c.attraction,
      gender: c.genders.attraction,
      locked: !g.attractionUnlocked && !c.attraction,
      lockHint: g.attractionBlockMessage
    }
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
