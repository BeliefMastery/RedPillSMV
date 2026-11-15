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
  const onPageHide = () => flush();
  const onVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      flush();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  engine._debouncedProgressCleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}
