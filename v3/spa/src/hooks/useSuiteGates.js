import { useEffect, useState } from "react";
import { getStageGateState } from "@site/shared/suite-completion.js";
import {
  hasPolarityAttractionUnlock,
  isNativeAndroid,
  refreshPolarityAttractionEntitlementFromPlay,
} from "@site/shared/premium-entitlement.js";

export function useSuiteGates() {
  const [gate, setGate] = useState(() => getStageGateState());

  useEffect(() => {
    const refresh = () => setGate(getStageGateState());
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
  }, []);

  function isLocked(path) {
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
  }

  return { gate, isLocked };
}
