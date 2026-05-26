import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getSuiteCompletion,
  getSuiteSnapshots,
} from "@site/shared/suite-completion.js";
import {
  buildArchetypeLayer,
  buildPolarityLayer,
  buildAttractionLayer,
  buildCurrentPatternSummary,
  buildNextMoveCandidates,
} from "@site/shared/integrated-map-excerpts.js";

const ROUTE_MAP = {
  "archetype.html": "/engines/archetype",
  "temperament.html": "/engines/polarity",
  "attraction.html": "/engines/attraction",
};

function GateView({ completion }) {
  const c = completion;
  const items = [
    { to: "/engines/archetype", label: "Archetype", done: c.archetype },
    { to: "/engines/polarity", label: "Polarity", done: c.polarity },
    { to: "/engines/attraction", label: "Attraction", done: c.attraction },
  ];
  return (
    <div className="surface">
      <h1 className="v3-hero-title">Integrated map</h1>
      <p className="v3-muted">
        Complete Archetype, then Polarity, then Attraction with the same respondent gender.
      </p>
      <ul className="suite-progress-list">
        {items.map((item) => (
          <li key={item.to} className="suite-progress-item">
            {item.done ? "✓" : "○"}{" "}
            <Link to={item.to}>{item.label}</Link>
            <span> — {item.done ? "Complete" : "Not started"}</span>
          </li>
        ))}
      </ul>
      {c.mismatch && (
        <p className="suite-mismatch-note">
          Gender mismatch across completed assessments.
        </p>
      )}
      <Link to="/" className="v3-btn v3-btn--outline">
        Back to home
      </Link>
    </div>
  );
}

function LayerSection({ layer }) {
  const href = ROUTE_MAP[layer.href] || layer.href;
  return (
    <section className="integrated-map-layer surface" style={{ marginTop: "1rem" }}>
      <h2 className="v3-section-title">{layer.title}</h2>
      {layer.subtitle && <p className="v3-muted">{layer.subtitle}</p>}
      {layer.frame?.helps && <p>{layer.frame.helps}</p>}
      <Link to={href} className="v3-btn v3-btn--soft">
        {layer.hrefLabel || "Open assessment"}
      </Link>
    </section>
  );
}

export default function IntegratedMapPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const c = getSuiteCompletion();
    if (!c.allThree || !c.sameRespondentGender) {
      setContent({ type: "gate", completion: c });
      return;
    }
    const snapshots = getSuiteSnapshots();
    if (!snapshots.archetype || !snapshots.polarity || !snapshots.attraction) {
      setContent({ type: "gate", completion: getSuiteCompletion() });
      return;
    }
    const a = snapshots.archetype;
    const t = snapshots.polarity;
    const r = snapshots.attraction;
    const archL = buildArchetypeLayer(a?.analysisData || {});
    const polL = buildPolarityLayer(t?.analysisData || {});
    const attL = buildAttractionLayer(r || {});
    const summary = buildCurrentPatternSummary(a, t, r);
    const nextMoves = buildNextMoveCandidates(a, t, r, {
      layers: { archL, polL, attL },
    });
    setContent({
      type: "map",
      summary,
      layers: [archL, polL, attL],
      nextMoves,
    });
  }, []);

  if (!content) return <p className="v3-muted">Loading…</p>;
  if (content.type === "gate") return <GateView completion={content.completion} />;

  return (
    <div className="stack">
      <h1 className="v3-hero-title">Integrated map</h1>
      {content.summary && (
        <div className="surface">
          <h2 className="v3-section-title">Your current pattern</h2>
          {typeof content.summary === "object" ? (
            <>
              {content.summary.identity && <p>{content.summary.identity}</p>}
              {content.summary.market && <p>{content.summary.market}</p>}
            </>
          ) : (
            <p>{String(content.summary)}</p>
          )}
        </div>
      )}
      {content.layers.map((layer) => (
        <LayerSection key={layer.title} layer={layer} />
      ))}
      {content.nextMoves?.length > 0 && (
        <div className="surface">
          <h2 className="v3-section-title">Your next move</h2>
          <ul>
            {content.nextMoves.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="v3-muted">
        <Link to="/">Home</Link> · <Link to="/engines/relationship">Relationships</Link> (separate lens)
      </p>
    </div>
  );
}
