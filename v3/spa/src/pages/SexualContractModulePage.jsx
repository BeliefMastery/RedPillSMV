import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

export default function SexualContractModulePage() {
  const gender = useMemo(() => getArchetypeGenderForSuite(), []);
  const questions = useMemo(() => getInventoryQuestionsForGender(gender), [gender]);
  const [answers, setAnswers] = useState({});
  const [savedSci, setSavedSci] = useState(null);

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
        <h1 id="sci-title">Optional context inventory</h1>
        <p className="v3-lead">
          Attitude items that enrich SCI/PCS reads on Polarity, Attraction, and the integrated map.
          Methodology is already embedded in the suite assessments—this inventory is supplementary only.
        </p>
        <p className="v3-muted" style={{ fontSize: "0.95rem" }}>
          Descriptive self-assessment only—not moral judgment, political instruction, or therapy.
          Stored locally on this device.
        </p>
      </div>

      <div className="surface">
        {!gender && (
          <p style={{ marginTop: 0 }}>
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
        <p className="v3-muted" style={{ marginTop: "1rem", fontSize: "0.88rem" }}>
          Storage key: <code>{SEXUAL_CONTRACT_STORAGE_KEY}</code>
        </p>
      </div>
    </section>
  );
}
