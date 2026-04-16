# Temperament spectrums: reasoning and reevaluation plan

## Why the current pairing can confuse respondents

**`provision_and_nurture` (label: Nurture and attentive-presence vs Provision and resources)**  
The underlying items mix (a) **logistics, security, and problem-solving action** with (b) **emotional warmth, attunement, and receiving care**. That is a coherent “provision vs nurture” tradeoff. The word **presence**, however, is ambiguous: in polarity language it often means **holding / grounded / directive calm** (read as masculine-leaning *focused presence*) as well as **attuned, receptive witness** (read as feminine-leaning *attentive presence*). Tying “presence” to the nurture pole without “attentive” invited that confusion; the label update makes the intended pole explicit.

**`focus_and_expression` (Expressive flow vs Focused action)**  
This dimension mixes **task focus and emotional regulation for completion** with **expressive, feeling-first processing**. That overlaps partially with how people use “presence” (still, goal-locked body vs flowing affect). So two different ideas—“what kind of presence I hold” and “whether I lead with feeling or execution”—can both feel loaded into “presence” and “focus,” which weakens discriminant validity in self-report.

## Alternative construct hypothesis (for calibration work)

Treat as **two cleaner axes**:

1. **Nurture ↔ Provision** — Care, attunement, emotional labor, warmth vs resources, protection, logistics, instrumental action. (Close to the current `provision_and_nurture` intent if items are purged of pure “presence” confounds.)

2. **Focused presence ↔ Attentive presence** — Grounded holding, directive calm, container vs receptive attunement, soft attention, witness. (This is **not** the same as nurture/provision: one can be high provision with either presence style, in principle.)

Under this model, some content currently under **Expressive flow vs Focused action** may belong partly on a **presence** axis (e.g. “set feelings aside to complete the task” vs “let emotions inform the task” can read as regulation style, which is adjacent to presence but not identical to “expressive vs focused” in conversation).

## Reevaluation plan (metrics, questions, weights)

### Phase 1 — Conceptual audit (no code change)

- Build a **item-to-construct matrix** for every `prov_*` and `foc_*` stem: tag each with Nurture, Provision, Focused presence, Attentive presence, Expressive flow, or Mixed.
- Mark **cross-loading** items that drive correlation between the two dimensions; these are prime rewrite or relocation candidates.
- Align **masculinePoleLabel / femininePoleLabel** and **spectrumLabel** with the post-audit constructs so labels cannot contradict item content.

### Phase 2 — Question set redesign

- **Minimum:** Rewrite stems and `poleLabels` so “presence” language matches **attentive** vs **instrumental** consistently on `provision_and_nurture`; add one clarifying hint where stems are ambiguous.
- **Stronger:** Add a **pilot block** of 3–4 new items explicitly testing **focused vs attentive presence**; run offline on volunteers and check factor structure (even simple correlation tiers).
- **If splitting dimensions:** Introduce a new dimension key (e.g. `presence_focus`) with its own weight in `temperament-scoring.js`, and **migrate** or **duplicate** items only after versioning (see Phase 5).

### Phase 3 — Weight and composite calibration

- In [`temperament-data/temperament-scoring.js`](temperament-data/temperament-scoring.js), `DIMENSION_WEIGHTS` (e.g. `provision_and_nurture: 1.2`, `focus_and_expression: 1.0`) should be revisited after item changes so the **composite** still tracks intended polarity without over-weighting a blurred dimension.
- Re-run or extend [`scripts/`](../scripts) sensitivity checks if present; document before/after **expected gender trend** alignment and **anomaly rate** so changes do not explode false “Temperament anomaly” flags.
- Validate **Phase 1 vs Phase 2** composite stability (same respondents, old vs new instrument) if you keep a shadow scoring path.

### Phase 4 — Report and normative copy

- Update [`shared/temperament-normative-clarifier.js`](../shared/temperament-normative-clarifier.js) and any hardcoded education copy if dimension meanings shift.
- Check [`temperament-data/intimate-dynamics.js`](../temperament-data/intimate-dynamics.js) for overlapping phrases (“emotional presence vs Contained focus”) so the suite uses **one glossary** for “presence” terms.

### Phase 5 — Versioning and migration

- If dimension keys or weights change materially, bump an **assessment version** in stored results and avoid silently comparing old snapshots to new norms.
- Document changes in this file and in maintainer notes so exports and integrated map stay consistent.

## Immediate product change (done separately)

- Report chrome: removed boilerplate paragraphs above the dimension list (on-screen and export).
- Earlier label iteration: **Nurture and attentive-presence vs Provision and resources** — superseded by glossary-aligned copy (see below).

## Language implementation (controlled vocabulary pass)

- **Glossary:** [TEMPERAMENT_GLOSSARY.md](./TEMPERAMENT_GLOSSARY.md) — term IDs, per-dimension allowlist, audit summary.
- **Decisions + read-aloud protocol:** [TEMPERAMENT_LANGUAGE_DECISION_LOG.md](./TEMPERAMENT_LANGUAGE_DECISION_LOG.md).
- **Code copy (no weight changes):**
  - `provision_and_nurture`: spectrum **Attuned care and warmth vs Practical support and resources**; stems/poles use attunement/warmth (not unqualified “presence”).
  - `focus_and_expression`: spectrum **Feeling-led processing vs Goal-led execution**; `foc_2` reframed as recount style.
  - `stability_and_movement`: “presence” → attunement / steadiness / composure where it overlapped core dimensions.
  - Intimate `emotional_responses`: **Receptive openness vs Contained steady focus**; related stems/poles updated.
  - `attraction_signals` & intimate satisfaction/arousal items: “presence” → **bearing**, **how you show up**, or **grounded bearing** per glossary.
  - Phase 1 `temperament-orientation.js`: aligned with provision/nurture wording; p1_orientation_4 option text avoids ambiguous “staying present.”

This document remains the roadmap for deeper instrument work (item matrix, optional new dimension, weight calibration). The vocabulary pass runs **before** Phase 3 weight changes. Structural Phases 2–5 (new items/dimensions) stay sequenced after the Phase 1 item-to-construct matrix is completed.

---

## Repository context

This app ships as **static web** and **Capacitor Android**. **Polarity** and **Attraction** require a **Google Play** one-time unlock on native Android only; web builds are unaffected. See [ANDROID_IAP.md](ANDROID_IAP.md), [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md), and [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).
