import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ALLOCATION_TARGET,
  createEmptyWeights,
  formatAllocationPercent,
  isValidAllocationAnswer,
  parseAllocationPercentInput,
  redistributeOnChange,
  sumWeights,
} from "../shared/allocation-scales.mjs";

test("createEmptyWeights sums to target", () => {
  const w = createEmptyWeights(["a", "b", "c"]);
  assert.equal(sumWeights(w), DEFAULT_ALLOCATION_TARGET);
});

test("parse and format allocation percent", () => {
  assert.equal(parseAllocationPercentInput(45.2), 452);
  assert.equal(formatAllocationPercent(452), 45.2);
});

test("redistributeOnChange conserves sum", () => {
  const ids = ["a", "b", "c", "d"];
  const prior = { a: 700, b: 200, c: 70, d: 30 };
  const out = redistributeOnChange("a", 710, prior, DEFAULT_ALLOCATION_TARGET, ids);
  assert.equal(sumWeights(out), DEFAULT_ALLOCATION_TARGET);
  assert.equal(out.a, 710);
});

test("spreads one percent across others on tenth-scale drag", () => {
  const ids = ["a", "b", "c", "d"];
  const prior = { a: 700, b: 200, c: 70, d: 30 };
  const out = redistributeOnChange("a", 710, prior, DEFAULT_ALLOCATION_TARGET, ids);
  assert.ok(out.b < prior.b);
  assert.ok(out.c <= prior.c);
  assert.ok(out.d <= prior.d);
});

test("isValidAllocationAnswer", () => {
  const w = createEmptyWeights(["a", "b"]);
  assert.ok(isValidAllocationAnswer({ weights: w, sum: DEFAULT_ALLOCATION_TARGET }));
});
