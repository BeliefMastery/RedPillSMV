import { useMemo, useState } from "react";

const GLOSSARY_ENTRIES = [
  {
    term: "SMV (Sexual Market Value)",
    tag: "Attraction",
    definition:
      "Composite percentile ranking of a person's mate-market leverage across Coalition Rank, Reproductive Confidence, and Axis of Attraction.",
  },
  {
    term: "Delusion Index",
    tag: "Attraction",
    definition:
      "Quantified differential between stated partner standards/expectations and actual scored market leverage.",
  },
  {
    term: "OSR (Operational Sex Ratio)",
    tag: "Sexual Contract",
    definition:
      "Ratio of marriageable/competing men to women in a given market; high OSR intensifies male-male competition and hypergamous consolidation.",
  },
  {
    term: "RAD Activity",
    tag: "Attraction",
    definition:
      "Novel, cool, or radical pursuits outside the relationship that create benign competition for a mate's attention and mitigate relational boredom.",
  },
  {
    term: "Coalition Rank",
    tag: "Attraction",
    definition:
      "Standing within male or female social hierarchies, dominance/status networks, and peer respect.",
  },
  {
    term: "Reproductive Confidence",
    tag: "Attraction",
    definition:
      "Evolutionary signal of paternal/maternal reliability, health, resource stability, and pair-bond security.",
  },
  {
    term: "SCI (Sexual Contract Index)",
    tag: "Sexual Contract",
    definition:
      "Measures structural fragility of long-term householding vs. short-term transactional access across OSR, hypergamy load, consequence insulation, and civilization ROI.",
  },
  {
    term: "PCS (Polarity Collapse Score)",
    tag: "Polarity",
    definition:
      "Measures abdication of masculine initiative, compensatory feminine direction (Director role), and Beautiful Ones withdrawal.",
  },
  {
    term: "Cross-Polarity",
    tag: "Polarity",
    definition:
      "Condition where an individual's scored behavioral/intimate temperament leans opposite to their biological sex's baseline pole.",
  },
  {
    term: "Universe 25 / Behavioral Sink",
    tag: "Sexual Contract",
    definition:
      "Calhoun's ethological paradigm of role collapse, 'Beautiful Ones' self-grooming without approach, and demographic decline under consequence insulation.",
  },
  {
    term: "Greek Subtype Accents",
    tag: "Archetype",
    definition:
      "Intra-family refinements (e.g., Alpha-Xi Protector, Beta-Iota Gentle Nurturer) distinguishing specific behavioral strategies inside a parent class.",
  },
];

export default function GlossaryDrawer({ onClose }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY_ENTRIES;
    return GLOSSARY_ENTRIES.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-drawer-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.68)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <aside
        className="surface"
        style={{
          width: "min(26rem, 92vw)",
          height: "100%",
          borderRadius: 0,
          overflowY: "auto",
          padding: "1.25rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="glossary-drawer-title" className="v3-section-title" style={{ margin: 0 }}>
            Suite Glossary
          </h2>
          <button type="button" className="v3-btn v3-btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="v3-muted" style={{ fontSize: "0.86rem", margin: "0.5rem 0 0.75rem" }}>
          Operational definitions for vernacular and diagnostic constructs used across the suite.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms (OSR, RAD, SMV...)"
          aria-label="Search glossary"
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--v3-surface-border)",
            background: "var(--v3-panel-solid)",
            color: "var(--v3-text)",
            marginBottom: "1rem",
          }}
        />
        <div className="stack" style={{ gap: "0.75rem" }}>
          {filtered.map((item) => (
            <div
              key={item.term}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--v3-surface-border)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <strong style={{ fontSize: "0.95rem" }}>{item.term}</strong>
                <span className="v3-muted" style={{ fontSize: "0.75rem" }}>
                  {item.tag}
                </span>
              </div>
              <p className="v3-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.86rem" }}>
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
