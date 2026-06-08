import { useCallback, useEffect, useState } from "react";
import {
  PAGE_ERROR_EVENT,
  clearPageErrors,
  formatPageErrorsForCopy,
  getPageErrors,
  subscribePageErrors,
} from "@site/shared/page-error-reporter.js";

function severityLabel(severity) {
  if (severity === "warn") return "Warning";
  if (severity === "info") return "Info";
  return "Error";
}

export default function PageErrorReporter() {
  const [entries, setEntries] = useState(() => getPageErrors());
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sync = useCallback((list) => {
    setEntries(list ?? getPageErrors());
    if ((list?.length ?? getPageErrors().length) > 0) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    sync(getPageErrors());
    const unsub = subscribePageErrors(sync);
    const onEvent = (e) => sync(e.detail?.entries);
    window.addEventListener(PAGE_ERROR_EVENT, onEvent);
    return () => {
      unsub();
      window.removeEventListener(PAGE_ERROR_EVENT, onEvent);
    };
  }, [sync]);

  const errorCount = entries.filter((e) => e.severity === "error").length;
  const warnCount = entries.filter((e) => e.severity === "warn").length;
  const total = entries.length;

  if (!total) return null;

  const onCopy = async () => {
    const text = formatPageErrorsForCopy(entries);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: no clipboard
    }
  };

  const onClear = () => {
    clearPageErrors();
    setOpen(false);
    setCopied(false);
  };

  return (
    <div
      className={`page-error-reporter${open ? " page-error-reporter--open" : ""}`}
      role="region"
      aria-label="Application errors"
    >
      <button
        type="button"
        className="page-error-reporter__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="page-error-reporter__badge" aria-hidden="true">
          {total}
        </span>
        <span>
          {errorCount > 0
            ? `${errorCount} error${errorCount === 1 ? "" : "s"}`
            : `${warnCount} warning${warnCount === 1 ? "" : "s"}`}{" "}
          — {open ? "hide" : "view"} details
        </span>
      </button>

      {open && (
        <div className="page-error-reporter__panel">
          <div className="page-error-reporter__toolbar">
            <strong>Recent issues</strong>
            <div className="page-error-reporter__actions">
              <button type="button" className="page-error-reporter__btn" onClick={onCopy}>
                {copied ? "Copied" : "Copy log"}
              </button>
              <button type="button" className="page-error-reporter__btn" onClick={onClear}>
                Clear
              </button>
              <button
                type="button"
                className="page-error-reporter__close"
                onClick={() => setOpen(false)}
                aria-label="Collapse error panel"
              >
                ×
              </button>
            </div>
          </div>
          <p className="page-error-reporter__hint v3-muted">
            Same messages as the browser console (F12). Copy the log when reporting a bug.
          </p>
          <ol className="page-error-reporter__list">
            {entries
              .slice()
              .reverse()
              .map((entry) => (
                <li
                  key={entry.id}
                  className={`page-error-reporter__item page-error-reporter__item--${entry.severity}`}
                >
                  <div className="page-error-reporter__meta">
                    <span className="page-error-reporter__severity">
                      {severityLabel(entry.severity)}
                    </span>
                    <time dateTime={new Date(entry.timestamp).toISOString()}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </time>
                    {entry.context && (
                      <span className="page-error-reporter__context">{entry.context}</span>
                    )}
                  </div>
                  <p className="page-error-reporter__message">{entry.message}</p>
                  {entry.detail && (
                    <details className="page-error-reporter__details">
                      <summary>Stack / detail</summary>
                      <pre>{entry.detail}</pre>
                    </details>
                  )}
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
