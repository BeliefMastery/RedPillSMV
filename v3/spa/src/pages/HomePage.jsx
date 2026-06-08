import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSuiteCompletion, getStageGateState } from "@site/shared/suite-completion.js";
import { useSuiteGates } from "../hooks/useSuiteGates.js";
import { engineRoutes } from "../routes.js";

function genderBadge(gender) {
  if (!gender) return null;
  const symbol = gender === "male" ? "♂" : "♀";
  return <span className="suite-gender-badge"> {symbol}</span>;
}

export default function HomePage() {
  const { isLocked } = useSuiteGates();
  const [completion, setCompletion] = useState(null);
  const [gate, setGate] = useState(null);

  useEffect(() => {
    setCompletion(getSuiteCompletion());
    setGate(getStageGateState());
    const refresh = () => {
      setCompletion(getSuiteCompletion());
      setGate(getStageGateState());
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const tools = [
    { route: engineRoutes[0], done: completion?.archetype, gender: completion?.genders?.archetype },
    {
      route: engineRoutes[1],
      done: completion?.polarity,
      gender: completion?.genders?.polarity,
      locked: !gate?.polarityUnlocked && !completion?.polarity,
      lockHint: gate?.polarityBlockMessage,
    },
    {
      route: engineRoutes[2],
      done: completion?.attraction,
      gender: completion?.genders?.attraction,
      locked: !gate?.attractionUnlocked && !completion?.attraction,
      lockHint: gate?.attractionBlockMessage,
    },
  ];

  return (
    <section className="stack" aria-labelledby="tools-title">
      <div className="surface surface--home">
        <h1 className="v3-hero-title" id="tools-title">
          <span className="home-suite-title-line">🔌 Unplugged Dynamics:</span>
          <br />
          <span className="home-suite-title-line">💊 Red-Pill Relational Suite ♂ ♀</span>
        </h1>

        <div className="home-image-grid" role="navigation" aria-label="Assessment tools">
          {engineRoutes.map((r) => {
            const lockHint = isLocked(r.path);
            if (lockHint) {
              return (
                <span
                  key={r.id}
                  className="home-image-grid-link suite-nav-locked"
                  title={lockHint}
                  aria-disabled="true"
                >
                  <img src={r.cover} alt={r.label} loading="lazy" />
                </span>
              );
            }
            return (
              <Link key={r.id} to={r.path} className="home-image-grid-link">
                <img src={r.cover} alt={r.label} loading="lazy" />
              </Link>
            );
          })}
        </div>

        <div className="suite-progress-wrap">
        <h2 className="v3-section-title">Suite progress (this device)</h2>
        <ul className="suite-progress-list" role="list">
          {tools.map(({ route, done, gender, locked, lockHint }) => (
            <li
              key={route.id}
              className={`suite-progress-item${done ? " suite-progress-item--complete" : ""}${locked ? " suite-progress-item--locked" : ""}`}
            >
              <span aria-hidden="true">{done ? "✓" : locked ? "🔒" : "○"}</span>{" "}
              {locked ? (
                <span className="suite-progress-link--locked" title={lockHint}>
                  {route.shortLabel}
                </span>
              ) : (
                <Link to={route.path} className="suite-progress-link">
                  {route.shortLabel}
                </Link>
              )}
              <span className="suite-progress-status">
                {done ? " — Complete" : locked ? ` — Locked` : " — Not started"}
              </span>
              {done && genderBadge(gender)}
            </li>
          ))}
        </ul>
        </div>

        {completion?.mismatch && (
          <p className="suite-mismatch-note">
            Gender mismatch across completed assessments. Re-run the out-of-context result to
            generate a valid integrated map.
          </p>
        )}

        {completion?.allThree && completion?.sameRespondentGender && (
          <div className="suite-integrated-cta v3-hero-actions">
            <Link to="/integrated-map" className="v3-btn v3-btn--primary">
              Open integrated map
            </Link>
            <p className="v3-muted">
              Combined read across identity, expression, and market position. Data stays on this
              device.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
