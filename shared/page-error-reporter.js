/**
 * Central page-visible error reporting (console, uncaught, engine).
 * Lightweight ring buffer + debounced UI events; safe for production.
 */

const EVENT_NAME = "redpill-page-error";
const MAX_ENTRIES = 25;
const DEDUPE_MS = 2500;
const NOTIFY_DEBOUNCE_MS = 80;
const IGNORE_PATTERNS = [
  /resizeobserver loop/i,
  /download the react devtools/i,
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
];

let initialized = false;
let reporting = false;
let seq = 0;
/** @type {import('./page-error-reporter.js').PageErrorEntry[]} */
const entries = [];
const recentKeys = new Map();
let notifyTimer = null;
/** @type {Set<(entries: PageErrorEntry[]) => void>} */
const subscribers = new Set();

/** @typedef {'error'|'warn'|'info'} PageErrorSeverity */
/**
 * @typedef {object} PageErrorEntry
 * @property {string} id
 * @property {PageErrorSeverity} severity
 * @property {string} message
 * @property {string} [detail]
 * @property {string} [context]
 * @property {number} timestamp
 * @property {string} source
 */

function escapeText(str) {
  if (typeof str !== "string") return String(str ?? "");
  const el = document.createElement("div");
  el.textContent = str;
  return el.innerHTML;
}

function shouldIgnore(message) {
  if (!message) return true;
  return IGNORE_PATTERNS.some((re) => re.test(message));
}

function dedupeKey(severity, message, context) {
  return `${severity}|${context || ""}|${(message || "").slice(0, 160)}`;
}

function messageFromValue(value) {
  if (value == null) return "";
  if (value instanceof Error) {
    return value.message || value.name || "Error";
  }
  if (typeof value === "string") return value;
  try {
    const json = JSON.stringify(value);
    return json.length > 600 ? `${json.slice(0, 597)}…` : json;
  } catch {
    return String(value);
  }
}

function detailFromError(err) {
  if (!(err instanceof Error)) return undefined;
  const stack = err.stack || "";
  return stack.length > 4000 ? `${stack.slice(0, 3997)}…` : stack;
}

function messageFromConsoleArgs(args) {
  if (!args?.length) return "Console message";
  return args
    .map((a) => messageFromValue(a))
    .filter(Boolean)
    .join(" ")
    .slice(0, 800);
}

function detailFromConsoleArgs(args) {
  const err = args?.find((a) => a instanceof Error);
  if (err?.stack) return detailFromError(err);
  if (args.length > 1) {
    try {
      const rest = args.slice(1).map((a) => messageFromValue(a)).join("\n");
      return rest.slice(0, 2000) || undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function scheduleNotify() {
  if (notifyTimer != null) return;
  notifyTimer = setTimeout(() => {
    notifyTimer = null;
    const snapshot = getPageErrors();
    subscribers.forEach((fn) => {
      try {
        fn(snapshot);
      } catch {
        // no-op
      }
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, { detail: { entries: snapshot } })
      );
    }
  }, NOTIFY_DEBOUNCE_MS);
}

/**
 * @param {Partial<PageErrorEntry> & { message: string }} input
 * @returns {PageErrorEntry|null}
 */
export function reportPageError(input) {
  if (!input?.message) return null;
  const severity = input.severity || "error";
  const message = String(input.message).trim();
  if (!message || shouldIgnore(message)) return null;

  const context = input.context ? String(input.context) : undefined;
  const key = dedupeKey(severity, message, context);
  const now = Date.now();
  const last = recentKeys.get(key);
  if (last && now - last < DEDUPE_MS) return null;
  recentKeys.set(key, now);
  if (recentKeys.size > 64) {
    const cutoff = now - DEDUPE_MS * 4;
    for (const [k, t] of recentKeys) {
      if (t < cutoff) recentKeys.delete(k);
    }
  }

  const entry = {
    id: `pe-${++seq}`,
    severity,
    message: message.slice(0, 800),
    detail: input.detail ? String(input.detail).slice(0, 4000) : undefined,
    context,
    timestamp: input.timestamp || now,
    source: input.source || "app",
  };

  entries.push(entry);
  while (entries.length > MAX_ENTRIES) entries.shift();
  scheduleNotify();
  return entry;
}

export function getPageErrors() {
  return entries.slice();
}

export function clearPageErrors() {
  entries.length = 0;
  recentKeys.clear();
  scheduleNotify();
}

export function subscribePageErrors(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

/**
 * @param {object} [options]
 * @param {boolean} [options.captureConsole=true]
 * @param {boolean} [options.captureGlobal=true]
 */
export function initPageErrorReporter(options = {}) {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const captureConsole = options.captureConsole !== false;
  const captureGlobal = options.captureGlobal !== false;

  if (captureGlobal) {
    window.addEventListener("error", (event) => {
      if (reporting) return;
      const msg = event.message || messageFromValue(event.error) || "Script error";
      reportPageError({
        severity: "error",
        message: msg,
        detail: detailFromError(event.error) || (event.filename
          ? `${event.filename}:${event.lineno || 0}:${event.colno || 0}`
          : undefined),
        context: "uncaught",
        source: "uncaught",
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      if (reporting) return;
      const reason = event.reason;
      const msg =
        reason instanceof Error
          ? reason.message || "Unhandled promise rejection"
          : messageFromValue(reason) || "Unhandled promise rejection";
      reportPageError({
        severity: "error",
        message: msg,
        detail: detailFromError(reason instanceof Error ? reason : undefined),
        context: "unhandledrejection",
        source: "unhandledrejection",
      });
    });
  }

  if (captureConsole) {
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);

    console.error = (...args) => {
      origError(...args);
      if (reporting) return;
      const message = messageFromConsoleArgs(args);
      if (!message || shouldIgnore(message)) return;
      reportPageError({
        severity: "error",
        message,
        detail: detailFromConsoleArgs(args),
        context: "console.error",
        source: "console",
      });
    };

    console.warn = (...args) => {
      origWarn(...args);
      if (reporting) return;
      const message = messageFromConsoleArgs(args);
      if (!message || shouldIgnore(message)) return;
      reportPageError({
        severity: "warn",
        message,
        detail: detailFromConsoleArgs(args),
        context: "console.warn",
        source: "console",
      });
    };
  }
}

/** Run fn without re-reporting console output it produces. */
export function withoutErrorReporting(fn) {
  reporting = true;
  try {
    return fn();
  } finally {
    reporting = false;
  }
}

export async function withoutErrorReportingAsync(fn) {
  reporting = true;
  try {
    return await fn();
  } finally {
    reporting = false;
  }
}

export function formatPageErrorsForCopy(list = getPageErrors()) {
  return list
    .map((e) => {
      const time = new Date(e.timestamp).toISOString();
      const lines = [`[${time}] ${e.severity.toUpperCase()} (${e.source})`];
      if (e.context) lines.push(`Context: ${e.context}`);
      lines.push(e.message);
      if (e.detail) lines.push(e.detail);
      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

export { EVENT_NAME as PAGE_ERROR_EVENT, escapeText as escapePageErrorText };
