import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MOUSE_UTOPIA_DISCLAIMER,
  MOUSE_UTOPIA_SECTIONS,
  SEXUAL_CONTRACT_INTRO,
} from "@site/sexual-contract-data/mouse-utopia-content.mjs";
import {
  getInventoryQuestionsForGender,
  INVENTORY_SCALE,
} from "@site/sexual-contract-data/inventory-questions.mjs";
import { computeSexualContractIndex } from "@site/shared/sexual-contract-index.mjs";
import {
  readInventoryPayload,
  writeInventoryPayload,
  SEXUAL_CONTRACT_STORAGE_KEY,
} from "@site/shared/sexual-contract-storage.mjs";
import { getArchetypeGenderForSuite } from "@site/shared/suite-completion.js";

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="surface" style={{ marginTop: "1rem" }}>
      <button
        type="button"
        className="v3-btn v3-btn--ghost"
        style={{ width: "100%", textAlign: "left", justifyContent: "space-between" }}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 1rem 1rem" }}>{children}</div>}
    </section>
  );
}

export default function SexualContractModulePage() {
  const gender = useMemo(() => getArchetypeGenderForSuite(), []);
  const questions = useMemo(() => getInventoryQuestionsForGender(gender), [gender]);
  const [answers, setAnswers] = useState({});
  const [savedSci, setSavedSci] = useState(null);
  const [tab, setTab] = useState("framework");

  useEffect(() => {
    const payload = readInventoryPayload();
    if (payload?.answers) setAnswers(payload.answers);
    if (payload?.sci) setSavedSci(payload.sci);
  }, []);

  const handleSave = () => {
    const sci = computeSexualContractIndex({
      gender,
      inventoryAnswers: answers,
    });
    writeInventoryPayload({
      version: 1,
      gender,
      answers,
      sci,
      savedAt: new Date().toISOString(),
    });
    setSavedSci(sci);
  };

  return (
    <section className="stack" aria-labelledby="sci-title">
      <div className="surface">
        <h1 id="sci-title">{SEXUAL_CONTRACT_INTRO.title}</h1>
        <p className="v3-lead">{SEXUAL_CONTRACT_INTRO.lead}</p>
        <p className="v3-muted" style={{ fontSize: "0.95rem" }}>
          {SEXUAL_CONTRACT_INTRO.disclaimer}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button
            type="button"
            className={`v3-btn ${tab === "framework" ? "" : "v3-btn--ghost"}`}
            onClick={() => setTab("framework")}
          >
            Framework
          </button>
          <button
            type="button"
            className={`v3-btn ${tab === "mouse" ? "" : "v3-btn--ghost"}`}
            onClick={() => setTab("mouse")}
          >
            Mouse Utopia
          </button>
          <button
            type="button"
            className={`v3-btn ${tab === "inventory" ? "" : "v3-btn--ghost"}`}
            onClick={() => setTab("inventory")}
          >
            Context inventory
          </button>
        </div>
      </div>

      {tab === "framework" && (
        <div className="surface">
          <h2>Sexual contract thesis (summary)</h2>
          <ul style={{ lineHeight: 1.6 }}>
            <li>
              High operational sex ratio and hypergamous consolidation price average men out of stable
              householding.
            </li>
            <li>
              When transactional access dominates, civilization ROI collapses—surplus labor and legacy
              defense weaken.
            </li>
            <li>
              Consequence insulation (reproductive decoupling + institutional security) accelerates the
              shift.
            </li>
            <li>
              Polarity collapse: compensatory initiation when masculine perpetual proposal abdicates—not
              liberation preference alone.
            </li>
          </ul>
          <p className="v3-muted">
            Full maintainer reference:{" "}
            <code>docs/COLLAPSE_SEXUAL_CONTRACT_FRAMEWORK.md</code>
          </p>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/engines/archetype">Start with Archetype</Link> — inventory optional; core suite
            unchanged.
          </p>
        </div>
      )}

      {tab === "mouse" && (
        <div>
          <p className="v3-muted" style={{ marginBottom: "0.75rem" }}>
            {MOUSE_UTOPIA_DISCLAIMER}
          </p>
          {MOUSE_UTOPIA_SECTIONS.map((sec, i) => (
            <CollapsibleSection key={sec.id} title={sec.title} defaultOpen={i === 0}>
              <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sec.body}</p>
              {sec.items && (
                <table style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.95rem" }}>
                  <tbody>
                    {sec.items.map(([a, b]) => (
                      <tr key={a}>
                        <td style={{ padding: "0.35rem 0.5rem 0.35rem 0", verticalAlign: "top" }}>
                          <strong>{a}</strong>
                        </td>
                        <td style={{ padding: "0.35rem 0", verticalAlign: "top" }}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CollapsibleSection>
          ))}
        </div>
      )}

      {tab === "inventory" && (
        <div className="surface">
          <h2>Context inventory</h2>
          <p className="v3-muted">
            Attitude items only—not medical history or voting data. Stored locally under{" "}
            <code>{SEXUAL_CONTRACT_STORAGE_KEY}</code>. Enriches SCI/PCS on Polarity, Attraction, and
            Integrated Map reports.
          </p>
          {!gender && (
            <p style={{ marginTop: "0.75rem" }}>
              Complete <Link to="/engines/archetype">Archetype</Link> first for gender-tailored items; you
              may still answer universal items below.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {questions.map((q) => (
              <fieldset key={q.id} style={{ marginTop: "1.25rem", border: "none", padding: 0 }}>
                <legend style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{q.text}</legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {INVENTORY_SCALE.map((v) => (
                    <label key={v} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={v}
                        checked={answers[q.id] === v}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button type="submit" className="v3-btn" style={{ marginTop: "1.5rem" }}>
              Save inventory
            </button>
          </form>
          {savedSci && (
            <div
              className="panel-brand-left"
              style={{ marginTop: "1.5rem", padding: "1rem", borderLeft: "4px solid var(--accent)" }}
            >
              <h3 style={{ marginTop: 0 }}>Saved SCI / PCS snapshot</h3>
              <p>
                Contract fragility: <strong>{Math.round(savedSci.contractFragility * 100)}%</strong> (
                {savedSci.contractFragilityLabel})
              </p>
              <p>
                Polarity collapse: <strong>{Math.round(savedSci.polarityCollapse * 100)}%</strong> (
                {savedSci.polarityCollapseLabel})
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
