import { useState } from "react";
import { invalidateSuiteCompletionCache } from "@site/shared/suite-completion.js";

const SUITE_STORAGE_KEYS = [
  "archetype-assessment:progress",
  "attraction-assessment-results",
  "temperament-assessment:progress",
  "relationship-assessment:progress",
  "sexual-contract-inventory:v1",
  "redpill-style-overlay",
  "redpill-font-scale",
];

function buildBackupPayload() {
  const data = {};
  for (const key of SUITE_STORAGE_KEYS) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    } catch {
      // ignore storage read errors
    }
  }
  return {
    schema: "redpill-suite-backup:v1",
    exportedAt: new Date().toISOString(),
    data,
  };
}

export default function BackupRestoreModal({ onClose }) {
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState(null);

  const handleCopy = async () => {
    try {
      const json = JSON.stringify(buildBackupPayload(), null, 2);
      await navigator.clipboard.writeText(json);
      setStatus({ ok: true, msg: "Suite state copied to clipboard." });
    } catch {
      setStatus({ ok: false, msg: "Clipboard copy unavailable. Use Download JSON instead." });
    }
  };

  const handleDownload = () => {
    const json = JSON.stringify(buildBackupPayload(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redpill-suite-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ ok: true, msg: "Backup JSON downloaded." });
  };

  const applyPayload = (rawText) => {
    try {
      const parsed = JSON.parse(rawText);
      if (
        !parsed ||
        parsed.schema !== "redpill-suite-backup:v1" ||
        typeof parsed.data !== "object" ||
        parsed.data === null
      ) {
        setStatus({ ok: false, msg: "Invalid backup format or schema mismatch." });
        return;
      }
      let restoredCount = 0;
      for (const key of SUITE_STORAGE_KEYS) {
        if (typeof parsed.data[key] === "string") {
          localStorage.setItem(key, parsed.data[key]);
          restoredCount += 1;
        }
      }
      invalidateSuiteCompletionCache();
      window.dispatchEvent(new Event("storage"));
      setStatus({
        ok: true,
        msg: `Restored ${restoredCount} profile store(s). Reloading view…`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      setStatus({ ok: false, msg: "Could not parse JSON backup." });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        applyPayload(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="surface"
        style={{ maxWidth: "30rem", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="backup-modal-title" className="v3-section-title" style={{ margin: 0 }}>
            Backup &amp; Restore Profile
          </h2>
          <button type="button" className="v3-btn v3-btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="v3-muted" style={{ fontSize: "0.9rem", margin: "0.75rem 0" }}>
          All data stays local on this device. Export your state to transfer between web and mobile or
          guard against browser cache resets.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          <button type="button" className="v3-btn v3-btn--primary" onClick={handleDownload}>
            Download JSON
          </button>
          <button type="button" className="v3-btn v3-btn--outline" onClick={handleCopy}>
            Copy to clipboard
          </button>
        </div>

        <hr style={{ borderColor: "var(--v3-surface-border)", margin: "1rem 0" }} />

        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
          Restore from JSON file
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            style={{ display: "block", marginTop: "0.35rem" }}
          />
        </label>

        <label style={{ display: "block", marginTop: "0.75rem", fontWeight: 600 }}>
          Or paste backup JSON
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"schema":"redpill-suite-backup:v1", ...}'
            style={{
              width: "100%",
              marginTop: "0.35rem",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid var(--v3-surface-border)",
              background: "var(--v3-panel-solid)",
              color: "var(--v3-text)",
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          />
        </label>
        <button
          type="button"
          className="v3-btn v3-btn--soft"
          style={{ marginTop: "0.5rem" }}
          disabled={!importText.trim()}
          onClick={() => applyPayload(importText)}
        >
          Restore pasted JSON
        </button>

        {status && (
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.88rem",
              color: status.ok ? "var(--v3-accent)" : "var(--v3-danger)",
            }}
          >
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
