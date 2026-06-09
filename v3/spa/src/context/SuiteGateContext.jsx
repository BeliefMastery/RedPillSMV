import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  getStageGateState,
  getSuiteCompletion,
} from "@site/shared/suite-completion.js";
import { initSuiteNavGates } from "@site/shared/suite-nav-gates.js";
import {
  hasPolarityAttractionUnlock,
  isNativeAndroid,
  refreshPolarityAttractionEntitlementFromPlay,
} from "@site/shared/premium-entitlement.js";

const SuiteGateContext = createContext(null);

export function SuiteGateProvider({ children }) {
  const location = useLocation();
  const [gate, setGate] = useState(() => getStageGateState());
  const [completion, setCompletion] = useState(() => getSuiteCompletion());

  const refresh = useCallback(() => {
    setGate(getStageGateState());
    setCompletion(getSuiteCompletion());
    initSuiteNavGates();
  }, []);

  useEffect(() => {
    refresh();
    if (isNativeAndroid()) {
      refreshPolarityAttractionEntitlementFromPlay().then(refresh);
    }
    window.addEventListener("redpill-premium-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("redpill-premium-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    initSuiteNavGates();
  }, [location.pathname, location.hash]);

  const isLocked = useCallback(
    (path) => {
      if (path === "/engines/polarity") {
        if (!gate.polarityUnlocked) return gate.polarityBlockMessage;
        if (isNativeAndroid() && !hasPolarityAttractionUnlock()) {
          return "Unlock Polarity and Attraction with a one-time Google Play purchase.";
        }
      }
      if (path === "/engines/attraction") {
        if (!gate.attractionUnlocked) return gate.attractionBlockMessage;
        if (isNativeAndroid() && !hasPolarityAttractionUnlock()) {
          return "Unlock Polarity and Attraction with a one-time Google Play purchase.";
        }
      }
      return null;
    },
    [gate]
  );

  const value = useMemo(
    () => ({ gate, completion, isLocked }),
    [gate, completion, isLocked]
  );

  return (
    <SuiteGateContext.Provider value={value}>{children}</SuiteGateContext.Provider>
  );
}

export function useSuiteGateContext() {
  const ctx = useContext(SuiteGateContext);
  if (!ctx) {
    throw new Error("useSuiteGateContext must be used within SuiteGateProvider");
  }
  return ctx;
}
