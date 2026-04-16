# Archetype Subclass Skew Diagnosis

## 1) Subclass selection path and tie behavior

Current selection in `archetype-engine.js` is:

1. Compute weighted scores for every archetype lane.
2. Roll up family/class totals (`*_family`, `*_family_female`) from subtype lanes.
3. Normalize each family total by effective scored subtype count.
4. Pick primary/secondary/tertiary family by normalized family score.
5. Inside each chosen family, rank subtypes by:
   - `weighted` descending
   - `phase2` descending (tie-break)
6. Top subtype becomes the displayed primary/secondary/tertiary archetype line.

Implication:
- If subtype evidence inside a winning family is sparse (many lanes near 0), the top two lanes can sit in near-tie territory.
- Near-ties increase fallback pressure toward whichever lane has slightly denser upstream evidence.

## 2) Expected subclass frequency from spread priors

Based on `archetype-data/archetype-spread.js`:

- Male expected non-vanilla rate: ~36%
- Female expected non-vanilla rate: ~52%
- Combined expected non-vanilla rate: ~44%

By family (combined):

- Alpha: non-vanilla ~54.55%
- Beta: non-vanilla ~45.12%
- Gamma: non-vanilla ~62.5%
- Delta: non-vanilla ~27.66%
- Sigma: non-vanilla ~50%
- Omega: non-vanilla ~20%
- Phi: effectively single-lane

Interpretation:
- Non-vanilla prevalence should be family-specific, not globally uniform.
- Gamma/Alpha should show variants frequently.
- Delta/Omega should remain mostly vanilla.

## 3) Why vanilla can still appear often

Most plausible contributors:

- Many class-level questions assign evidence to base family IDs (`alpha`, `beta`, etc.), creating broad family signal before subtype divergence.
- Family-level gates/context multipliers mostly adjust families broadly, improving class selection but not strongly separating sibling subtypes.
- If the winning family has low non-zero subtype density, top-lane selection can be driven by small deltas.

## 4) Class traits vs intra-class divergences

- Alpha: leadership/dominance core; Xi = protector, Rho = law/justice, Dark = tyrannical power.
- Beta: support/duty/belonging core; Iota = gentle-innocent, Nu = traditional settler, Kappa = coalition/approval, Rho = controlling nurturer.
- Gamma: outsider-intellectual core; Nu = romantic idealist, Theta = mystic/prophetic, Pi = opportunistic risk, Dark = nihilistic detachment.
- Delta: practical service/provision core; Mu = protective caretaker, Dark = martyr-sacrifice pattern.
- Sigma: autonomy/outside-hierarchy core; Kappa = strategist/schemer, Lambda = creative recluse, Dark-Zeta = anti-system shadow.
- Omega: withdrawal/low-agency core; Dark = destructive/entropic expression.
- Phi: transcendent integration, effectively single-lane in spread logic.

## 5) Diagnostics added to verify skew causes

`analysisData.subclassDiagnostics` now includes:

- `selectionFlow`
- `winningFamilyId`
- `winningFamilyRawScore`
- `winningFamilyNormalizedScore`
- `winningFamilyEffectiveSubtypeCount`
- `winningFamilyTopSubtypes` (top 5 lanes by weighted, phase2 tie-break)
- `winningFamilyNonZeroSubtypeCount`
- `tiePressure` (`weightedDelta`, `phase2Delta` between top two winning-family lanes)
- `topWeightedSubtypesGlobal`

This allows direct confirmation of whether observed vanilla-heavy outcomes come from:

- sparse non-zero subtype evidence,
- near-tie fallback pressure,
- or family-level weighting dominance before intra-family divergence.

## 6) Adaptive final determinative phase (Phase 6)

When `low_signal_density OR high_tie_pressure` is detected in the top-ranked family diagnostics, a conditional Phase 6 runs:

- Questions are selected only for the current primary/secondary/tertiary family groups.
- Questions are subtype-discriminator prompts (not class-level broad traits).
- Scoring writes into a bounded `phase6` channel and can reorder subclass picks only inside those same top 3 families.
- Families outside the top 3 are excluded from post-Phase-6 ranking.

Additional diagnostics:

- `subclassDiagnostics.finalPhaseDecision`
- `phase6Results.triggered`
- `phase6Results.targetFamilyIds`
- `phase6Results.beforePhase6`
- `phase6Results.afterPhase6`

---

## Repository context

This app ships as **static web** and **Capacitor Android**. **Polarity** and **Attraction** require a **Google Play** one-time unlock on native Android only; web builds are unaffected. See [ANDROID_IAP.md](ANDROID_IAP.md), [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md), and [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).
