import { useEffect, useRef, useState } from "react";
import { reportPageError } from "@site/shared/page-error-reporter.js";
import { applyExternalUIOptions } from "@site/shared/spa-engine-external.js";
import { attachDomQuestionSpaApi } from "@site/shared/spa-questionnaire-host.js";
import { engineClassNames, engineLoaders } from "./engineModules.js";

export function useEngineHost(engineId) {
  const engineRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const bump = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        const loader = engineLoaders[engineId];
        if (!loader) throw new Error(`Unknown engine: ${engineId}`);
        const mod = await loader();
        const className = engineClassNames[engineId];
        const EngineClass = mod[className] || mod.default;
        if (!EngineClass) throw new Error(`Engine class not found: ${className}`);

        const instance = new EngineClass({
          externalUI: true,
          onNotify: (event, payload) => {
            if (cancelled) return;
            if (event === "phase" && payload?.phase) setPhase(payload.phase);
            if (event === "init" && payload?.phase) setPhase(payload.phase);
            if (event === "question" || event === "selection" || event === "results") {
              if (event === "results") setPhase("results");
              bump();
            }
          },
        });

        applyExternalUIOptions(instance, {
          externalUI: true,
          onNotify: instance.onNotify,
        });
        attachDomQuestionSpaApi(instance);

        if (instance.ready && typeof instance.ready.then === "function") {
          await instance.ready;
        }

        if (cancelled) {
          instance.destroy?.();
          return;
        }

        engineRef.current = instance;
        window[`${engineId}Engine`] = instance;
        const syncPhase = () => {
          const next = instance.getPhase?.() || "idle";
          setPhase(next);
        };
        syncPhase();
        setReady(true);
        bump();
        syncPhase();
      } catch (e) {
        if (!cancelled) {
          const err = e instanceof Error ? e : new Error(String(e));
          reportPageError({
            severity: "error",
            message: err.message || `Failed to load engine: ${engineId}`,
            detail: err.stack,
            context: `engine:${engineId}`,
            source: "engine",
          });
          setError(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      const eng = engineRef.current;
      if (eng) {
        eng.setExternalQuestionMount?.(null);
        eng.setExternalResultsMount?.(null);
        eng.destroy?.();
        engineRef.current = null;
      }
    };
  }, [engineId]);

  return {
    engine: engineRef.current,
    phase,
    tick,
    ready,
    error,
    setPhase,
    bump,
  };
}
