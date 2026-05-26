import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_ALLOCATION_TARGET, sumWeights } from "../shared/allocation-scales.mjs";
import {
  DUAL_POLE_MEMBER_IDS,
  redistributeDisplayPercents,
  weightsFromValueAllocation,
  weightsToAllocationPercents,
} from "../shared/questionnaire-allocation.mjs";

test("redistributeDisplayPercents conserves 100%", () => {
  const ids = ["a", "b", "c", "d"];
  const prior = [70, 20, 7, 3];
  const out = redistributeDisplayPercents(prior, ids, 0, 71);
  const sum = out.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 100) < 0.05);
  assert.equal(out[0], 71);
});

test("Example A: moving lead 70 to 71 decreases all others", () => {
  const ids = ["a", "b", "c", "d"];
  const prior = [70, 20, 7, 3];
  const out = redistributeDisplayPercents(prior, ids, 0, 71);
  assert.ok(out[1] < prior[1]);
  assert.ok(out[2] <= prior[2]);
  assert.ok(out[3] <= prior[3]);
});

test("weightsFromValueAllocation upgrades legacy integer percents", () => {
  const ids = ["a", "b", "c", "d"];
  const weights = weightsFromValueAllocation([70, 20, 7, 3], ids);
  assert.equal(sumWeights(weights), DEFAULT_ALLOCATION_TARGET);
  assert.equal(weights.a, 700);
});

test("2-member: left 50 to 70 gives right 30", () => {
  const out = redistributeDisplayPercents([50, 50], DUAL_POLE_MEMBER_IDS, 0, 70);
  assert.equal(out[0], 70);
  assert.equal(out[1], 30);
});

test("round-trip display percents via weights", () => {
  const ids = ["x", "y"];
  const w = weightsFromValueAllocation([60, 40], ids);
  const back = weightsToAllocationPercents(w, ids);
  assert.equal(back[0], 60);
  assert.equal(back[1], 40);
});
