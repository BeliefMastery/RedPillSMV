# Proposal: Perceived Respect Context (Social vs. Business) for Archetype Attribution

## Problem Summary

The assessment tends to over-assign **Alpha and alpha variants** to respondents who are more accurately **Delta/Beta combinations**: high achievers (wealthy, competent, status-focused) who are *called* alpha in business contexts but do **not** feel respected by their **peer group or local social network**. That gap (respected in business, not in social/relational life) is a strong signal of **status achieved in hierarchy** rather than **naturally accorded respect**, and points to Beta/Delta patterns (including aggrieved, approval-seeking, or overcompensating) rather than true Alpha.

To correct for this, we need to capture **where** the respondent feels respected (and, optionally, how they believe others see them) and use it to **modulate archetype attribution across all archetypes**, not only Alpha/Beta/Delta.

---

## 1. Implications of Self-Reported Respect by Context

### 1.1 “I feel respected by my **peer group / local social network**”

**Definition:** Friends, family, neighbourhood, community, non-work social circles — people who know you outside role or title.

| Level | Implication |
|-------|-------------|
| **High** | Respect is granted in **relational** context — not only for role/status. Supports **Alpha** (natural command), **Beta** (valued for support/likability), **Sigma** (respected for independence), **Phi** (transcendent regard). |
| **Low** | Even if successful elsewhere, the person does not feel seen or valued in the circle that knows them “as a person.” Suggests **status is situational** (e.g. job-based) or that **relational dynamics** are strained — more consistent with **Beta** (seeking approval), **Delta** (valued for utility, not presence), **Omega** (overlooked), or **high-achieving Beta/Delta** with aggrieved undertone. |

### 1.2 “I feel respected by my **business / professional network**”

**Definition:** Colleagues, industry, clients, professional reputation — contexts where role, output, and hierarchy matter.

| Level | Implication |
|-------|-------------|
| **High** | Respect in **transactional / hierarchical** context. Can indicate **Alpha** (if also high socially), **Delta** (reliable, competent, “gets things done”), **Gamma** (expertise), or **Beta** (compliant, useful, “safe”). Does **not** by itself confirm “natural” leadership. |
| **Low** | Not feeling respected even in professional context. Can indicate **Omega**, **Delta** (undervalued), **Sigma** (opted out or marginal), or **Gamma** (misunderstood). |

### 1.3 Cross-Context Patterns (Social × Business)

| Social respect | Business respect | Archetype / bias implications |
|----------------|------------------|--------------------------------|
| **High / High** | **High / High** | **Alpha / Sigma / Phi** more plausible — respect generalizes. Reduces need to down-weight Alpha. |
| **High / Low** | **Low / High** | Valued as person, not as role. **Beta** (supportive, liked), **Sigma** (respected for independence), **Gamma** (valued for mind, not status). Suggests **down-weight** role-based “Alpha” if behavioral score is Alpha. |
| **Low / High** | **High / Low** | **Core discovery:** Status in hierarchy only; not “naturally” respected in life. Strong signal for **Beta/Delta** (competent, wealthy, status-obsessed, aggrieved) and **down-weight Alpha**. |
| **Low / Low** | **Low / Low** | Understood as **Omega**, **Delta** (undervalued), or **Sigma** (chosen marginality). **Alpha** unlikely; no boost. |

So: **business-only respect** should **reduce** confidence in Alpha (and possibly Gamma/Sigma as “natural” leaders) and **increase** weight for Beta/Delta and variants when behavioral answers lean Alpha.

---

## 2. Proposed New Questions (Perceived Respect Context)

Add a small **dedicated block** (e.g. in Phase 3, with or after aspiration questions) so that respect context is explicit and not mixed with general Likert items.

### 2.1 Core questions (minimum)

1. **Social/peer respect (feeling)**  
   *“In your personal life — friends, family, local community, people who know you outside work — how much do you feel respected by them?”*  
   - Scale: 1–5 (e.g. Not at all / Rarely / Sometimes / Often / Consistently), or 1–10 for consistency with other phases.

2. **Business/professional respect (feeling)**  
   *“In your professional or business context — colleagues, industry, clients — how much do you feel respected by them?”*  
   - Same scale.

### 2.2 Optional (strongly recommended)

3. **Social perception (belief about others’ view)**  
   *“How do you think most of your peers and local social circle would describe you in terms of influence or leadership?”*  
   - Options: e.g. “A natural leader / Someone people look to” vs “Respected but not really a leader” vs “More supportive than leading” vs “Someone who keeps to themselves” vs “Someone they don’t think about much.”  
   - Maps to **perceived** alpha/beta/sigma/omega in social context.

4. **Business perception (belief about others’ view)**  
   *“How do you think most of your professional contacts would describe you in terms of influence or leadership?”*  
   - Same style of options.  
   - Captures “called alpha at work” vs “seen as competent but not leader.”

These four together give: **felt respect** (social vs business) + **perceived role** (social vs business), which is enough to apply the logic below.

---

## 3. System: Respect-Context Adjustment (All Archetypes)

Treat **respect context** like **aspiration**: compute a **respect-context profile**, then apply **multipliers** to archetype scores **before** (or alongside) aspiration adjustments, so that:

- **Alpha** is not over-attributed when respect is **business-only**.
- **Beta / Delta** (and variants) are boosted when the pattern “high business respect, low social respect” appears and behavioral scores lean Alpha.
- **Sigma / Gamma / Omega / Phi** are modulated in a consistent way across the board.

### 3.1 Compute respect-context profile

- Derive:
  - `socialRespect`: score from Q1 (and optionally Q3 mapped to a 1–5).
  - `businessRespect`: score from Q2 (and optionally Q4).
- Define bands, e.g.:
  - **High** = 4–5 (or top 40% of scale),
  - **Low** = 1–2 (or bottom 40%),
  - **Mid** = 3 (or middle 20%).
- Classify pattern: e.g. `social_high_business_high`, `social_low_business_high`, `social_high_business_low`, `social_low_business_low`, and mid combinations.

### 3.2 Adjustment rules (by pattern)

**Pattern: Social LOW, Business HIGH** (main correction case)

- **Alpha, alpha_xi, alpha_rho, dark_alpha:** multiply by **0.75–0.85** (reduce over-attribution).
- **Beta, beta_nu, beta_kappa, delta, delta_mu:** multiply by **1.15–1.25** (competent, status-seeking, possibly aggrieved).
- **Gamma, Sigma:** small **down-weight** (e.g. 0.95) for “natural leader” reading; optional **up-weight** for “valued for expertise / independence” if desired.
- **Omega:** slight **up-weight** (e.g. 1.05) if behavioral score already suggests withdrawal/overlooked.
- **Phi:** neutral or slight down (0.98) to avoid attributing “transcendent” when respect is context-bound.

**Pattern: Social HIGH, Business LOW**

- **Alpha:** slight **down-weight** (0.92) — leadership may be more relational than institutional.
- **Beta, Sigma, Gamma:** **up-weight** (1.08–1.12) — valued as person, not role.
- **Delta:** **down-weight** (0.90) — less “valued for utility at work.”
- **Omega:** **up-weight** (1.05) if “withdrawn but respected in close circle” is plausible.

**Pattern: Social HIGH, Business HIGH**

- **Alpha, Sigma, Phi:** **confirm** (1.02–1.05) — respect generalizes.
- **Beta, Omega:** slight **down-weight** (0.97) — less “merely supportive” or “overlooked” if respected in both.

**Pattern: Social LOW, Business LOW**

- **Alpha:** **down-weight** (0.85) — no evidence of generalized respect.
- **Omega, Delta:** **up-weight** (1.08–1.12) — undervalued or withdrawn.
- **Sigma:** optional **up-weight** (1.05) if “chosen marginality” is to be distinguished from Omega.

**Mid / mixed patterns**

- Use smaller multipliers (e.g. 0.97–1.03) so that respect context **nudges** rather than overrides behavioral scores.

### 3.3 Integration with existing pipeline

- **Where:** Run **after** phase 1–2 (and optionally phase 3) scores are aggregated, and **before or in parallel with** aspiration adjustments.
- **Storage:** Add e.g. `analysisData.respectContext = { socialRespect, businessRespect, pattern, adjustments }`.
- **Final score:** Apply both **respect-context multipliers** and **aspiration multipliers** to the same phase 1/2 (and optionally 3) scores; then compute weighted total and primary/secondary/tertiary as now.
- **Report:** Short line in “Methodology” or “Bias mitigation”: e.g. “Your reported respect in social vs. professional contexts was used to reduce over-attribution of leadership archetypes when respect was reported mainly in professional settings.”

---

## 4. Summary Table: Respect Context → Archetype Implications

| Respect pattern           | Alpha | Beta | Delta | Gamma | Sigma | Omega | Phi |
|---------------------------|-------|------|-------|-------|-------|-------|-----|
| Social high, Business high| ↑     | −    | −     | −     | ↑     | −     | ↑   |
| Social low,  Business high| ↓↓    | ↑↑   | ↑↑    | ↓     | ↓     | ↑     | ↓   |
| Social high, Business low | ↓     | ↑   | ↓     | ↑     | ↑     | ↑     | −   |
| Social low,  Business low | ↓     | −   | ↑     | −     | ↑     | ↑     | −   |

(↑ = up-weight, ↓ = down-weight, − = neutral or very small nudge; ↑↑/↓↓ = stronger correction.)

---

## 5. Implementation Checklist

- [ ] Add 2–4 questions to `archetype-questions.js` (e.g. Phase 3 or a short “Phase 2.5” block).
- [ ] In `archetype-engine.js`: persist answers (e.g. `respectContextAnswers`), compute `socialRespect`, `businessRespect`, and `pattern`.
- [ ] Add `calculateRespectContextAdjustments(pattern, topBehavioral)` returning `{ alpha: 0.8, beta: 1.2, ... }`.
- [ ] In `calculateFinalScores()`, apply respect-context adjustments (same way as aspiration) to phase1/phase2 (and optionally phase3) before or after aspiration.
- [ ] Store `analysisData.respectContext` and, if desired, surface a one-sentence note in the report.
- [ ] Optionally add one sentence in the intro or methodology explaining that “respect in different parts of your life” is used to improve accuracy.

This keeps the change **localized** (new questions + one adjustment layer) while making attribution **more accommodative** of the “called alpha at work but not respected at home” pattern and improving consistency **across all archetypes**.
