/**
 * Console-only error reporting for uncaught failures.
 * No on-page UI — engines use ErrorHandler for structured console output.
 */

let initialized = false;

const IGNORE_PATTERNS = [
  /resizeobserver loop/i,
  /download the react devtools/i,
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
];

function shouldIgnore(message) {
  if (!message) return true;
  return IGNORE_PATTERNS.some((re) => re.test(message));
}

/**
 * Log to console (kept for call-site compatibility).
 * @param {object} input
 */
export function reportPageError(input) {
  if (!input?.message) return null;
  const message = String(input.message).trim();
  if (!message || shouldIgnore(message)) return null;
  const severity = input.severity || "error";
  const prefix = input.context ? `[${input.context}] ` : "";
  const log = severity === "warn" ? console.warn : console.error;
  if (input.detail) {
    log(`${prefix}${message}`, input.detail);
  } else {
    log(`${prefix}${message}`);
  }
  return null;
}

export function getPageErrors() {
  return [];
}

export function clearPageErrors() {}

export function subscribePageErrors() {
  return () => {};
}

export function initPageErrorReporter() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (event) => {
    const msg = event.message || "Script error";
    if (shouldIgnore(msg)) return;
    console.error("[uncaught]", msg, event.error || `${event.filename}:${event.lineno}`);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg =
      reason instanceof Error
        ? reason.message || "Unhandled promise rejection"
        : String(reason ?? "Unhandled promise rejection");
    if (shouldIgnore(msg)) return;
    console.error("[unhandledrejection]", reason);
  });
}

export function withoutErrorReporting(fn) {
  return fn();
}

export async function withoutErrorReportingAsync(fn) {
  return fn();
}

export function formatPageErrorsForCopy() {
  return "";
}
