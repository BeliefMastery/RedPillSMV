import { shouldBootLegacyEngine } from "./spa-engine-external.js";

/**
 * Auto-start engines only on archived legacy HTML pages.
 * @param {() => void} factory
 */
export function bootEngineIfLegacy(factory) {
  if (!shouldBootLegacyEngine()) return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", factory);
  } else {
    factory();
  }
}
