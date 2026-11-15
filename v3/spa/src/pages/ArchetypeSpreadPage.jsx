import { useMemo, useState } from "react";
import { ARCHETYPE_SPREAD } from "@site/archetype-data/archetype-spread.js";

const FAMILIES = ["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Omega", "Phi"];

function parseEntry(entry) {
  const name = entry.name || "";
  const gender = name.endsWith(" Female") ? "female" : "male";
  const isShadow = name.startsWith("Dark ");
  const clean = name.replace(/^Dark\s+/, "").replace(/\s+(Male|Female)$/, "");
  const dashIdx = clean.indexOf("-");
  const family = dashIdx > -1 ? clean.slice(0, dashIdx) : clean;
  const isBase = !isShadow && dashIdx === -1;
  return {
    ...entry,
    gender,
    family: FAMILIES.includes(family) ? family : "Other",
    isShadow,
    isBase,
    tier: isBase ? "Base Family" : isShadow ? "Shadow Pole" : "Subtype Accent",
  };
}

export default function ArchetypeSpreadPage() {
  const [genderFilter, setGenderFilter] = useState("male");
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parsed = ARCHETYPE_SPREAD.map(parseEntry).filter((item) => {
      if (item.gender !== genderFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.socialRole || "").toLowerCase().includes(q) ||
        (item.attractionMarketRead || "").toLowerCase().includes(q) ||
        (item.jungianEquivalent || "").toLowerCase().includes(q)
      );
    });

    const groups = {};
    for (const fam of FAMILIES) groups[fam] = [];
    for (const item of parsed) {
      if (!groups[item.family]) groups[item.family] = [];
      groups[item.family].push(item);
    }
    return groups;
  }, [genderFilter, query]);

  return (
    <div className="stack">
      <div className="surface">
        <h1 className="v3-hero-title">Archetype Taxonomy &amp; Spread</h1>
        <p className="v3-muted">
          Hierarchical map of parent archetype families, Greek subtype accents, and shadow poles.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.4rem" }} role="group" aria-label="Gender filter">
            <button
              type="button"
              className={`v3-btn ${genderFilter === "male" ? "v3-btn--primary" : "v3-btn--outline"}`}
              onClick={() => setGenderFilter("male")}
            >
              ♂ Male
            </button>
            <button
              type="button"
              className={`v3-btn ${genderFilter === "female" ? "v3-btn--primary" : "v3-btn--outline"}`}
              onClick={() => setGenderFilter("female")}
            >
              ♀ Female
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, role, Jungian, market read..."
            aria-label="Filter archetypes"
            style={{
              flex: "1 1 14rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--v3-surface-border)",
              background: "var(--v3-panel-solid)",
              color: "var(--v3-text)",
            }}
          />
        </div>
      </div>

      {FAMILIES.map((family) => {
        const items = grouped[family];
        if (!items || items.length === 0) return null;
        return (
          <section key={family} className="surface" aria-label={`${family} family`}>
            <h2 className="v3-section-title" style={{ marginBottom: "0.75rem" }}>
              {family} Family
            </h2>
            <div className="stack" style={{ gap: "0.75rem" }}>
              {items.map((item) => (
                <article
                  key={item.name}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid var(--v3-surface-border)",
                    background: item.isBase ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.18)",
                    marginLeft: item.isBase ? "0" : "clamp(0.5rem, 2.5vw, 1.5rem)",
                    borderLeft: item.isShadow
                      ? "3px solid var(--v3-danger, #c62828)"
                      : item.isBase
                        ? "3px solid var(--v3-accent, #ffd700)"
                        : "3px solid var(--v3-muted, #888)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "0.5rem",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{item.name}</h3>
                    <span className="v3-muted" style={{ fontSize: "0.8rem" }}>
                      {item.tier} · ~{item.socialProportion}% pop.
                    </span>
                  </div>
                  <p style={{ margin: "0.35rem 0 0.45rem", fontWeight: 500 }}>{item.socialRole}</p>
                  {item.attractionMarketRead && (
                    <p className="v3-muted" style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
                      <strong>Market read:</strong> {item.attractionMarketRead}
                    </p>
                  )}
                  <div
                    className="v3-muted"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
                      gap: "0.35rem 0.75rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    {item.jungianEquivalent && (
                      <div>
                        <strong>Jungian:</strong> {item.jungianEquivalent}
                      </div>
                    )}
                    {item.greekPantheon && (
                      <div>
                        <strong>Myth:</strong> {item.greekPantheon}
                      </div>
                    )}
                    {item.vedicEquivalent && (
                      <div>
                        <strong>Vedic:</strong> {item.vedicEquivalent}
                      </div>
                    )}
                    {item.tarotCard && (
                      <div>
                        <strong>Tarot:</strong> {item.tarotCard}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
