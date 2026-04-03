# Temperament suite — controlled vocabulary

Authoritative terms for polarity copy. Prefer these strings (or close variants) so dimensions stay **discriminable** in self-report.

## Term IDs and definitions

| ID | Meaning | Example phrasing |
|----|---------|------------------|
| **NURTURE_ATTUNE** | Warmth, witness, tuning to emotional tone, receptive care | attunement, warmth, emotional tone, understanding, vulnerability (when paired with openness) |
| **PROVISION_INSTRUMENT** | Logistics, security, practical fixes, resource action | practical action, securing resources, instrumental support, responsibility for security |
| **FEELING_LED** | Affect and process shape how you think and act first | feeling-led processing, emotional response first, organic process |
| **GOAL_LED** | Objective, completion, compartmentalizing affect for the task | goal-led execution, clear objectives, analyze first then feel |
| **RECEPTIVE_OPENNESS** | Open, permeable, partner/state-aware in intimacy | receptive openness, openness and vulnerability, partner’s state impacts you |
| **CONTAINED_STEADY** | Steady, inwardly bounded, less merged in intimacy | contained steady focus, confidence and composure, remain focused on your own |
| **GROUNDING_STEADY** | Unmoved core, stabilizes others (not the same as NURTURE_ATTUNE) | steady direction, stabilizing steadiness, steady composure |
| **BEARING** | Overall manner/how you show up (attraction), not therapeutic attunement | bearing, how you show up, character and manner |

**Avoid** unqualified **presence** in core `provision_and_nurture` and `focus_and_expression` copy—it collides with intimate “presence” and with stabilizing/holding language.

## Per-dimension allowlist (where terms may appear)

| Dimension key | Allowed primary terms | Do not use here (use ID from glossary elsewhere) |
|---------------|----------------------|---------------------------------------------------|
| `provision_and_nurture` | NURTURE_ATTUNE, PROVISION_INSTRUMENT | unqualified “presence”; “focused presence” |
| `focus_and_expression` | FEELING_LED, GOAL_LED | “flow” as sole pole name (collides with `direction_and_structure`); unqualified “presence” |
| `direction_and_structure` | flow vs structure language already distinct | — |
| `stability_and_movement` | movement vs stability; GROUNDING_STEADY vs attuned responsiveness | reuse NURTURE_ATTUNE stems for stab items |
| `emotional_responses` (intimate) | RECEPTIVE_OPENNESS, CONTAINED_STEADY | “emotional presence” (deprecated—use receptive openness / attunement) |
| `attraction_signals` | BEARING, competence, vitality | “presence” as pole label—use **bearing** or **how you show up** |

## String audit summary (implemented pass)

| Location | Issue | Resolution |
|----------|--------|--------------|
| `provision_and_nurture` | spectrumLabel “attentive-presence” vs stems saying “emotional presence” | Spectrum **A**: Attuned care and warmth vs Practical support and resources; stems/poles use attunement/warmth |
| `focus_and_expression` | Label “Expressive flow vs Focused action” vs mixed cognitive/task items | Spectrum **D**: Feeling-led processing vs Goal-led execution; foc_2 recount framing |
| `emotional_responses` | “Openness and emotional presence vs Contained focus” | Spectrum **G**: Receptive openness vs Contained steady focus |
| `stability_and_movement` | “responsive presence” / “stabilizing presence” | Responsive **attunement**; stabilizing **steadiness** / steady direction |
| `attraction_signals` | “presence” in poles and items | **Bearing** / character and manner |
| `int_sat_3`, `int_ar_4`, `attr_resp_6` | “strength and presence” | **Strength and grounded bearing** (or clear direction) |
| `temperament-orientation` Phase 1 | Same as old prov_1 | Attunement and understanding |
| `int_sat_1` pole | “Present and receptive” | **Receptive to sensation** |

## Maintainer rule

Any new question or label change should cite **at least one term ID** in the PR/commit note so regressions are traceable.
