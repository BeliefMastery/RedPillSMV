import { Link } from "react-router-dom";

export default function SiteFooter({ theme, themes, onThemeChange }) {
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
      <p className="footer-controls">
        <label>
          Theme{" "}
          <select value={theme} onChange={(e) => onThemeChange(e.target.value)} aria-label="Theme">
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {" · "}
        <label>
          Font scale{" "}
          <select
            id="font-scale-select"
            defaultValue={localStorage.getItem("redpill-font-scale") || "1"}
            onChange={(e) => {
              localStorage.setItem("redpill-font-scale", e.target.value);
              document.documentElement.style.setProperty("--font-scale", e.target.value);
            }}
          >
            <option value="0.9">Small</option>
            <option value="1">Default</option>
            <option value="1.1">Large</option>
            <option value="1.2">Extra large</option>
          </select>
        </label>
      </p>
      <p>&copy; 2025 Belief Mastery &amp; Sovereign of Mind. All rights reserved.</p>
    </footer>
  );
}
