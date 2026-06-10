/**
 * Trailing debounce for progress persistence during slider drags.
 * Flush synchronously before navigation or page unload.
 */
export function attachDebouncedProgressSave(engine, methodName = "saveProgress", delayMs = 400) {
  let timer = null;

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (typeof engine[methodName] === "function") {
      engine[methodName]();
    }
  };

  engine.scheduleSaveProgress = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delayMs);
  };

  engine.flushSaveProgress = flush;

  const onBeforeUnload = () => flush();
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", onBeforeUnload);
  }

  engine._debouncedProgressCleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", onBeforeUnload);
    }
  };
}
