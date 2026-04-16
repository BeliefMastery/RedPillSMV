# Explanation and disclaimer dropdown audit

Scope: [`archetype.html`](../archetype.html), [`temperament.html`](../temperament.html), [`attraction.html`](../attraction.html), [`relationship.html`](../relationship.html), and shared styles/scripts.

## Inventory matrix

| Page | Extended explanation | Disclaimer | Instructions panel | Notes |
|---|---|---|---|---|
| Archetype | Yes | Yes | No | Standard two-panel intro disclosure stack |
| Temperament | Yes | Yes | No | Same as archetype + suite/paywall gate blocks below intro |
| Attraction | Yes | Yes | Yes (`#instructionsPanel`) | Instructions only appears in questionnaire section |
| Relationship | Yes | Yes | No | Had dead `setupToggle('instructionsToggle', ...)` call with no matching markup |

## Redundancy review

### Copy that is intentionally shared
- "Descriptive self-assessment only" lead sentence in disclaimer blocks (kept for legal consistency).
- "Privacy by design: no personal data leaves your device" line (kept verbatim across tools).
- "Save a readable HTML report..." phrasing in long-form explanation and export sections (kept to maintain consistent expectation).

### Copy that remains tool-specific
- Paradigm context and theory sections stay per-tool because they describe different scoring models (archetype role taxonomy, polarity spectrum, attraction market leverage, relationship strain/viability).

Decision: keep shared legal/privacy copy centralized by convention rather than runtime injection, to avoid adding content-loading complexity to static pages.

## Layout optimization opportunities (audited)

### Observations
- Two intro disclosure controls (Extended + Disclaimer) appear before action buttons on all four tools.
- Temperament and Attraction may add gate/paywall blocks between intro and CTA, increasing scroll depth on small screens.
- Attraction includes questionnaire instructions while Relationship did not.

### Chosen optimization for this pass
- Keep the current information architecture (no section relocation), but reduce intro disclosure vertical bulk by tightening toggle spacing.
- Keep Attraction instructions where they are (questionnaire context) and remove dead instructions wiring from Relationship.

Future option (not implemented here): combine Extended + Disclaimer into one "About and legal" accordion with two internal subsections.

## Behavior and accessibility findings

### Before
- Each page had duplicated inline `setupToggle()` logic.
- Disclosure triggers were `<div>` elements without explicit `aria-expanded`/`aria-controls`.
- Relationship included dead toggle wiring for a non-existent instructions panel.

### Implemented
- Added shared toggle script: [`shared/intro-disclosure-toggles.js`](../shared/intro-disclosure-toggles.js).
- Converted disclosure controls to semantic `<button type="button">` with:
  - `data-disclosure-target`
  - `aria-expanded`
  - `aria-controls`
- Removed duplicated inline toggle setup from all four pages.
- Removed Relationship dead instructions wiring by eliminating the missing-target setup call.
- Added focus-visible styling for disclosure controls in [`style.css`](../style.css).

## CSS hygiene findings

- Source of truth is [`style.css`](../style.css); theme overlay [`style/light.css`](../style/light.css) does not duplicate toggle behavior.
- [`backup-style.css`](../backup-style.css) contains older duplicated styles and should remain non-authoritative. No changes were made there.

## Files changed by this audit implementation

- [`archetype.html`](../archetype.html)
- [`temperament.html`](../temperament.html)
- [`attraction.html`](../attraction.html)
- [`relationship.html`](../relationship.html)
- [`style.css`](../style.css)
- [`shared/intro-disclosure-toggles.js`](../shared/intro-disclosure-toggles.js)

