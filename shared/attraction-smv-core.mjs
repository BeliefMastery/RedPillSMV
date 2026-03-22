/**
 * Pure SMV cluster/subcategory percentile math (browser + Node).
 * Kept in .mjs so Node can import without package "type": "module".
 * @see attraction-engine.js calculateSMV — keep logic in sync.
 */

export function scoreToPercentile(score) {
  const normalized = (score - 1) / 9;
  const sigmoid = 1 / (1 + Math.exp(-6 * (normalized - 0.5)));
  return sigmoid * 100;
}

/**
 * @param {Record<string, number>} responses
 * @param {{ ANTI_RAD_FLOOR: number, ANTI_RAD_THRESHOLD: number }} radModifier
 */
export function calculateRadActivityPercentile(responses, radModifier) {
  const r = responses;
  const rad1 = r.rad_1 ?? 1;
  const rad2 = r.rad_2 ?? 1;
  const rad3 = r.rad_3 ?? 1;
  const rad4 = r.rad_4 ?? 1;
  const norm = v => Math.max(0, Math.min(1, (v - 1) / 9));
  const weighted = 0.40 * norm(rad1) + 0.30 * norm(rad2) + 0.20 * norm(rad3) + 0.10 * norm(rad4);
  const rawScore = weighted * 9 + 1;
  let percentile = scoreToPercentile(rawScore);
  if (rad1 <= radModifier.ANTI_RAD_THRESHOLD) {
    percentile = Math.min(percentile, radModifier.ANTI_RAD_FLOOR);
  }
  return percentile;
}

/**
 * @param {object} options
 * @param {'male'|'female'} options.gender
 * @param {Record<string, number>} options.responses
 * @param {Record<string, { questions?: Array<{ id: string, subcategory: string, reverseScore?: boolean, weight?: number }> }>} options.clusters
 * @param {{ male: Record<string, number>, female: Record<string, number> }} options.axisSubWeights
 * @param {{ ANTI_RAD_FLOOR: number, ANTI_RAD_THRESHOLD: number } | null} options.radModifier - null skips rad override
 * @returns {{ clusters: Record<string, number>, subcategories: Record<string, Record<string, number>> }}
 */
export function computeSmvClustersAndSubs(options) {
  const { gender, responses, clusters, axisSubWeights, radModifier } = options;
  const smv = { clusters: {}, subcategories: {} };
  const rawScores = { clusters: {}, subcategories: {} };

  Object.keys(clusters).forEach(clusterId => {
    const cluster = clusters[clusterId];
    rawScores.clusters[clusterId] = [];
    rawScores.subcategories[clusterId] = {};
    (cluster.questions || []).forEach(q => {
      let v = responses[q.id];
      if (v == null) return;
      if (q.reverseScore) v = 11 - v;
      rawScores.clusters[clusterId].push(v);
      if (!rawScores.subcategories[clusterId][q.subcategory]) {
        rawScores.subcategories[clusterId][q.subcategory] = [];
      }
      const w = typeof q.weight === 'number' && q.weight > 0 ? q.weight : 1;
      rawScores.subcategories[clusterId][q.subcategory].push({ value: v, weight: w });
    });
    const arr = rawScores.clusters[clusterId];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    smv.clusters[clusterId] = scoreToPercentile(avg);
    smv.subcategories[clusterId] = {};
    Object.keys(rawScores.subcategories[clusterId]).forEach(sub => {
      const subEntries = rawScores.subcategories[clusterId][sub];
      const totalW = subEntries.reduce((s, e) => s + e.weight, 0);
      const subAvg =
        totalW > 0 ? subEntries.reduce((s, e) => s + e.value * e.weight, 0) / totalW : 0;
      smv.subcategories[clusterId][sub] = scoreToPercentile(subAvg);
    });

    if (gender === 'male' && clusterId === 'axisOfAttraction' && smv.subcategories[clusterId].radActivity != null && radModifier) {
      smv.subcategories[clusterId].radActivity = calculateRadActivityPercentile(responses, radModifier);
    }

    if (clusterId === 'axisOfAttraction') {
      const subScores = smv.subcategories[clusterId];
      const config = gender === 'male' ? axisSubWeights.male : axisSubWeights.female;
      const weightedEntries = Object.entries(config).filter(([k]) => subScores[k] != null);
      const totalWeight = weightedEntries.reduce((sum, [, w]) => sum + w, 0);
      if (totalWeight > 0) {
        const weightedSum = weightedEntries.reduce((sum, [k, w]) => sum + subScores[k] * w, 0);
        smv.clusters[clusterId] = weightedSum / totalWeight;
      }
    }
  });

  return smv;
}

/**
 * Overall SMV from cluster percentiles and cluster weights.
 */
export function computeOverallSmv(clusterPercentiles, clusterWeights) {
  return Object.keys(clusterWeights).reduce(
    (sum, k) => sum + (clusterPercentiles[k] || 0) * (clusterWeights[k] || 0),
    0
  );
}
