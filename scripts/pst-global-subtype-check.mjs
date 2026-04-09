/**
 * Regression: primary/secondary/tertiary are global top distinct subtypes (same class allowed).
 * Mirrors archetype-engine.js identifyArchetypes (intraclass hybrid rank + weighted gates).
 */
import { PHASE6_WEIGHT } from '../shared/archetype-phase6-logic.mjs';

const INTRACLASS_HYBRID_ALPHA = 0.36;
const INTRACLASS_REFINEMENT_EPS = 0.015;
const INTRACLASS_PHASE2_WEIGHT = 0.0194;
const ARCHETYPES = {
  alpha: {
    id: 'alpha',
    parentType: 'alpha',
    subtypes: ['alpha', 'alpha_xi', 'alpha_rho', 'dark_alpha']
  },
  alpha_xi: { id: 'alpha_xi', parentType: 'alpha' },
  alpha_rho: { id: 'alpha_rho', parentType: 'alpha' },
  dark_alpha: { id: 'dark_alpha', parentType: 'alpha' },
  beta: { id: 'beta', parentType: 'beta', subtypes: ['beta'] },
  gamma: { id: 'gamma', parentType: 'gamma', subtypes: ['gamma'] }
};

function getFamilyNodeIdForArchetype(archetypeId) {
  if (!archetypeId || !ARCHETYPES) return null;
  const id = String(archetypeId);
  if (id.includes('_family')) return id;
  const def = ARCHETYPES[id];
  const base = def?.parentType || id;
  if (base.endsWith('_female')) {
    return `${base.replace(/_female$/, '')}_family_female`;
  }
  return `${base}_family`;
}

function normalizeScoreEntry(v) {
  if (typeof v === 'number') return { weighted: v, phase2: 0, phase6: 0 };
  return {
    weighted: v.weighted ?? 0,
    phase2: v.phase2 ?? 0,
    phase6: v.phase6 ?? 0
  };
}

function buildSortedRows(scoresById) {
  const rows = Object.keys(scoresById)
    .map((archId) => {
      const archetype = ARCHETYPES[archId];
      if (!archetype || String(archId).includes('_family')) return null;
      const { weighted, phase2, phase6 } = normalizeScoreEntry(scoresById[archId]);
      const refinement =
        phase2 * INTRACLASS_PHASE2_WEIGHT + phase6 * PHASE6_WEIGHT;
      return {
        id: archId,
        ...archetype,
        weighted,
        refinement,
        rankScore: weighted,
        totalScore: weighted
      };
    })
    .filter(Boolean);

  const byFamily = new Map();
  for (const row of rows) {
    const fid = getFamilyNodeIdForArchetype(row.id);
    if (!fid) continue;
    if (!byFamily.has(fid)) byFamily.set(fid, []);
    byFamily.get(fid).push(row);
  }
  for (const group of byFamily.values()) {
    const wTotal = group.reduce((s, r) => s + r.weighted, 0);
    const rSum = group.reduce((s, r) => s + (r.refinement + INTRACLASS_REFINEMENT_EPS), 0);
    for (const r of group) {
      const share = (r.refinement + INTRACLASS_REFINEMENT_EPS) / rSum;
      r.rankScore =
        (1 - INTRACLASS_HYBRID_ALPHA) * r.weighted + INTRACLASS_HYBRID_ALPHA * wTotal * share;
    }
  }

  return rows.sort((a, b) => {
    if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
    if (b.refinement !== a.refinement) return b.refinement - a.refinement;
    return b.weighted - a.weighted;
  }).map((r) => {
    r.score = r.weighted;
    return r;
  });
}

function selectGlobalPst(sortedArchetypes, restrictToFamilies) {
  const allowFamilies =
    restrictToFamilies && restrictToFamilies.length > 0 ? new Set(restrictToFamilies) : null;
  const candidateSubtypes = allowFamilies
    ? sortedArchetypes.filter((arch) => {
        const fid = getFamilyNodeIdForArchetype(arch.id);
        return fid && allowFamilies.has(fid);
      })
    : sortedArchetypes;

  const seenSubtypeIds = new Set();
  const distinctSubtypeRows = [];
  for (const arch of candidateSubtypes) {
    if (seenSubtypeIds.has(arch.id)) continue;
    seenSubtypeIds.add(arch.id);
    distinctSubtypeRows.push(arch);
    if (distinctSubtypeRows.length >= 3) break;
  }

  const primaryRow = distinctSubtypeRows[0] || null;
  const primaryWeighted = primaryRow ? primaryRow.score : 0;
  const row2 = distinctSubtypeRows[1] || null;
  const row3 = distinctSubtypeRows[2] || null;
  const secondary =
    row2 && primaryWeighted > 0 && row2.score > primaryWeighted * 0.25 ? row2.id : null;
  const tertiary =
    row3 && primaryWeighted > 0 && row3.score > primaryWeighted * 0.15 ? row3.id : null;

  return {
    primary: primaryRow?.id ?? null,
    secondary,
    tertiary
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Second global slot is another Alpha subtype, not Beta (old model used 2nd family).
const sameFamily = selectGlobalPst(
  buildSortedRows({
    alpha: 1.0,
    alpha_xi: 0.4,
    beta: 0.35,
    gamma: 0.01
  })
);
assert(sameFamily.primary === 'alpha', 'Expected primary alpha.');
assert(
  sameFamily.secondary === 'alpha_xi',
  `Expected secondary alpha_xi (same class as primary), got ${sameFamily.secondary}`
);
assert(sameFamily.tertiary === 'beta', `Expected tertiary beta, got ${sameFamily.tertiary}`);

// Subtype-level gates suppress weak secondary/tertiary.
const gated = selectGlobalPst(
  buildSortedRows({
    alpha: 1.0,
    alpha_xi: 0.2,
    beta: 0.14
  })
);
assert(gated.primary === 'alpha', 'Expected primary alpha for gate test.');
assert(gated.secondary === null, 'Expected secondary null when below 0.25 * primary.');
assert(gated.tertiary === null, 'Expected tertiary null when below 0.15 * primary.');

// restrictToFamilies: only Alpha-class subtypes considered.
const restricted = selectGlobalPst(
  buildSortedRows({
    alpha: 0.5,
    alpha_rho: 0.45,
    dark_alpha: 0.4,
    beta: 0.99
  }),
  ['alpha_family']
);
assert(restricted.primary === 'alpha', `Expected primary alpha when restricted to alpha_family, got ${restricted.primary}`);
assert(restricted.secondary === 'alpha_rho', `Expected secondary alpha_rho, got ${restricted.secondary}`);
assert(restricted.tertiary === 'dark_alpha', `Expected tertiary dark_alpha, got ${restricted.tertiary}`);

// Higher phase2 on a variant can outrank vanilla when raw weighted is close (intraclass hybrid).
const refined = selectGlobalPst(
  buildSortedRows({
    alpha: { weighted: 1.0, phase2: 2, phase6: 0 },
    alpha_xi: { weighted: 0.95, phase2: 40, phase6: 0 },
    beta: { weighted: 0.5, phase2: 0, phase6: 0 }
  })
);
assert(refined.primary === 'alpha_xi', `Expected hybrid to lift alpha_xi over vanilla alpha, got ${refined.primary}`);

console.log('pst global subtype checks passed');
