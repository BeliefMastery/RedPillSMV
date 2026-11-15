import { useState } from "react";
import { Link } from "react-router-dom";
import BackupRestoreModal from "./BackupRestoreModal.jsx";
import GlossaryDrawer from "./GlossaryDrawer.jsx";

export default function SiteFooter() {
  const [showBackup, setShowBackup] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <footer>
      <details className="home-info-dropdown">
        <summary>Info</summary>
        <p>
          Four assessments for modern dating and relationship reality: archetype identification,
          percentile sexual market value, polarity, and relationship viability. Offline on your
          device.
        </p>
        <p>
          <Link to="/archetype-spread">View full archetype spread table</Link>
          {" · "}
          <Link to="/learn/mate-selection-tradeoffs">Mate-selection trade-offs</Link>
        </p>
      </details>
      <details className="home-info-dropdown">
        <summary>Disclaimer</summary>
        <p>
          <strong>Descriptive self-assessment only</strong>—not diagnosis, prediction, therapy,
          medical, or legal advice.
        </p>
        <p>
          <strong>Privacy by design:</strong> no personal data leaves your device in the default app
          flow.
        </p>
      </details>
      <div className="footer-controls" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "center" }}>
        <label>
          Font scale{" "}
          <select
            id="font-scale-select"
            defaultValue={localStorage.getItem("redpill-font-scale") || "1"}
            onChange={(e) => {
              localStorage.setItem("redpill-font-scale", e.target.value);
              document.documentElement.style.setProperty("--font-scale", e.target.value);
            }}
            aria-label="Font scale"
          >
            <option value="0.9">Small</option>
            <option value="1">Default</option>
            <option value="1.1">Large</option>
            <option value="1.2">Extra large</option>
          </select>
        </label>
        <button
          type="button"
          className="v3-btn v3-btn--outline"
          style={{ padding: "0.3rem 0.65rem", fontSize: "0.82rem" }}
          onClick={() => setShowGlossary(true)}
        >
          Glossary
        </button>
        <button
          type="button"
          className="v3-btn v3-btn--outline"
          style={{ padding: "0.3rem 0.65rem", fontSize: "0.82rem" }}
          onClick={() => setShowBackup(true)}
        >
          Backup / Restore
        </button>
      </div>
      <p>&copy; 2025 Belief Mastery &amp; Sovereign of Mind. All rights reserved.</p>
      {showBackup && <BackupRestoreModal onClose={() => setShowBackup(false)} />}
      {showGlossary && <GlossaryDrawer onClose={() => setShowGlossary(false)} />}
    </footer>
  );
}
