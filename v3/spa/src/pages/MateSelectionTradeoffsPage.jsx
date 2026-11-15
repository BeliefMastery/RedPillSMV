import { Link } from "react-router-dom";
import {
  LEARN_INTRO,
  getMateSelectionLearnSections,
} from "@site/shared/mate-selection-tradeoffs.mjs";

export default function MateSelectionTradeoffsPage() {
  const sections = getMateSelectionLearnSections();

  return (
    <section className="stack" aria-labelledby="mate-tradeoffs-title">
      <div className="surface">
        <h1 id="mate-tradeoffs-title">{LEARN_INTRO.title}</h1>
        <p className="v3-lead">{LEARN_INTRO.lead}</p>
        <p className="v3-muted" style={{ fontSize: "0.95rem" }}>
          {LEARN_INTRO.disclaimer}
        </p>
        <p className="v3-muted" style={{ marginTop: "0.75rem" }}>
          Female Attraction preferences can record your top postures; this page is the full framing.{" "}
          <Link to="/engines/attraction">Open Attraction</Link>
          {" · "}
          <Link to="/">Home</Link>
        </p>
      </div>

      {sections.map((sec) => (
        <div key={sec.id} className="surface">
          <h2 className="v3-section-title">{sec.title}</h2>
          {sec.body && <p style={{ lineHeight: 1.65 }}>{sec.body}</p>}
          {Array.isArray(sec.items) && sec.items.length > 0 && (
            <dl style={{ margin: "0.75rem 0 0" }}>
              {sec.items.map(([label, text]) => (
                <div key={label} style={{ marginBottom: "1rem" }}>
                  <dt style={{ fontWeight: 600 }}>{label}</dt>
                  <dd style={{ margin: "0.35rem 0 0", lineHeight: 1.6, color: "var(--muted, #9aa3b2)" }}>
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </section>
  );
}
