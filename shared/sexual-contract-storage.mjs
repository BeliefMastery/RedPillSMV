/**
 * localStorage helpers for sexual contract inventory.
 */

import { SEXUAL_CONTRACT_STORAGE_KEY } from './sexual-contract-config.mjs';
import {
  buildSexualContractInputFromSuite,
  computeSexualContractIndex
} from './sexual-contract-index.mjs';

export { SEXUAL_CONTRACT_STORAGE_KEY };

export function readInventoryPayload() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SEXUAL_CONTRACT_STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeInventoryPayload(payload) {
  try {
    localStorage.setItem(SEXUAL_CONTRACT_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/** @returns {object|null} computed SCI/PCS from inventory + suite snapshots */
export function getStoredSexualContractAnalysis() {
  const input = buildSexualContractInputFromSuite();
  const inv = readInventoryPayload();
  if (inv?.answers) input.inventoryAnswers = { ...input.inventoryAnswers, ...inv.answers };
  if (!Object.keys(input.inventoryAnswers).length && !input.dimensionScores?.hypergamy_and_choice) {
    return null;
  }
  return computeSexualContractIndex(input);
}

export function invalidateSexualContractCache() {
  /* reserved for future memoization */
}
