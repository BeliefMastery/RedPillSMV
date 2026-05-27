# Collapse / sexual contract framework

Maintainer reference for the evolutionary and game-theoretic framing integrated across the Red-Pill Relational Suite. Implementation: [`shared/sexual-contract-index.mjs`](../shared/sexual-contract-index.mjs), [`shared/sexual-contract-config.mjs`](../shared/sexual-contract-config.mjs), optional inventory [`sexual-contract-data/inventory-questions.mjs`](../sexual-contract-data/inventory-questions.mjs), educational module `#/learn/sexual-contract`.

## Thesis summary

1. **High operational sex ratio (OSR)** — marriageable men exceeding women distorts the mating market; male–male competition rises; an unmated underclass emerges.
2. **Hypergamous consolidation** — female choice consolidates on apex tiers; average men are priced out.
3. **Householding vs transactional access** — civilization maintenance depends on long-term contracts (labor, protection, legacy) vs short-term transactional access (situationships, monetized attention). When transactional dominates, civilization ROI collapses.
4. **Consequence insulation** — reproductive decoupling and institutional security (state-as-synthetic-householder proxies) remove feedback loops that once throttled hypergamy.
5. **Polarity collapse** — when masculine perpetual proposal abdicates, feminine initiation may become **compensatory direction** (Director role), not liberated preference alone.
6. **Mouse Utopia metaphor** — Calhoun Universe 25: unlimited resources, role death, Beautiful Ones (groom without approach), behavioral sink, extinction despite abundance. **Metaphor only** — not literal human prediction.

## SCI sub-indices (0–1)

| Index | Source |
|-------|--------|
| `osrExposure` | Inventory + attraction `sci_osr_1` |
| `hypergamyLoad` | Inventory + polarity `hypergamy_and_choice` |
| `transactionalDominance` | Inventory + attraction `sci_tx_1` |
| `householdingOrientation` | Inventory + `sci_hh_1` + reproductive cluster |
| `consequenceInsulation` | Inventory + polarity `consequence_insulation` + `sci_ins_1` |
| `civilizationROI` | Inventory + `sci_roi_*` (hedonic item inverted) |

**Composite:** `contractFragility` — weighted sum documented in config; clamped 0–1.

## PCS sub-indices (0–1)

| Index | Source |
|-------|--------|
| `masculineProposalAbsent` | Inventory + polarity `pcs_mpa_*` + male initiative |
| `directorCompensation` | Inventory + polarity `pcs_dir_*` |
| `beautifulOnesWithdrawal` | Inventory + `pcs_bo_1` + aesthetic vs initiative cross |
| `behavioralSinkRisk` | Inventory + transactional + inverse civilization ROI |

**Convergence:** collapse framing requires cross-signal agreement — see `evaluateCollapseConvergence()` in [`shared/sexual-contract-index.mjs`](../shared/sexual-contract-index.mjs). High female initiate **preference** alone does **not** trigger collapse copy.

## Assessment mapping

| Engine | Integration |
|--------|-------------|
| **Inventory / module** | Optional; `localStorage` key `sexual-contract-inventory:v1` |
| **Archetype** | Phase 3 `p3_contract_roi`; spread overlay via [`shared/archetype-contract-market-read.mjs`](../shared/archetype-contract-market-read.mjs) |
| **Polarity** | `consequence_insulation`, `polarity_collapse_context`, `attr_hyp_6`; PCS report block |
| **Attraction** | `sexualContractContext` phase (`sciOnly` — excluded from headline SMV); SCI cluster nudge ≤±2; delusion boost; contract read section |
| **Relationship** | Transactional compatibility copy (householding vs extraction) |
| **Integrated map** | `buildSexualContractIntegratedExcerpt()` |

## Calibration caps

- Cluster nudge: `SEXUAL_CONTRACT_CLUSTER_DELTA_CAP` (default 2) — see [`shared/sexual-contract-config.mjs`](../shared/sexual-contract-config.mjs)
- Delusion boost: max +15 via `applySciDelusionBoost`
- Reference spread `socialProportion` in [`archetype-data/archetype-spread.js`](../archetype-data/archetype-spread.js) is **unchanged** — per-user reads use overlay helpers only

## Copy guardrails

- Attitude items only — no contraception use or voting history
- Mouse Utopia surfaces include irreversibility / enclosure disclaimer
- Director/first-move copy is **structural**, not prescriptive (“women shouldn’t initiate”)
- Descriptive self-assessment — see [`docs/EXPLANATION_DISCLAIMER_AUDIT.md`](./EXPLANATION_DISCLAIMER_AUDIT.md)

## Validation

```bash
node scripts/sexual-contract-check.mjs
```

Bump `SEXUAL_CONTRACT_CALIBRATION_VERSION` in config when weights or convergence rules change.
