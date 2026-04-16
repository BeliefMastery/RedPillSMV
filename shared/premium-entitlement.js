/**
 * Google Play one-time unlock for Polarity + Attraction (Android / Capacitor only).
 * Web and non-Android builds: no paywall; hasPolarityAttractionUnlock() is effectively true.
 */
import { Capacitor } from './vendor/capacitor-core.js';
import { showAlert } from './confirm-modal.js';
import { getStageGateState } from './suite-completion.js';

/** Must match the managed product id in Play Console (see docs/ANDROID_IAP.md). */
export const POLARITY_ATTRACTION_PRODUCT_ID = 'com.beliefmastery.redpill.unlock_polarity_attraction';

const STORAGE_KEY = 'redpill_unlock_polarity_attraction_v1';
const STORAGE_VALUE = '1';

let playSyncPromise = null;
let nativePurchasesApiPromise = null;

async function getNativePurchasesApi() {
  if (!isNativeAndroid()) return null;
  if (!nativePurchasesApiPromise) {
    nativePurchasesApiPromise = import('./vendor/native-purchases/index.js')
      .then((m) => ({ NativePurchases: m.NativePurchases, PURCHASE_TYPE: m.PURCHASE_TYPE }))
      .catch(() => null);
  }
  return nativePurchasesApiPromise;
}

export function isNativeAndroid() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

function readStoredUnlockFlag() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE;
  } catch {
    return false;
  }
}

function setStoredUnlockFlag(on) {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

function transactionIsValidPurchase(t) {
  if (!t || t.productIdentifier !== POLARITY_ATTRACTION_PRODUCT_ID) return false;
  if (Capacitor.getPlatform() === 'android') return String(t.purchaseState) === '1';
  return true;
}

/**
 * Synchronous entitlement check (local cache). Call refreshPolarityAttractionEntitlementFromPlay on load for accuracy.
 */
export function hasPolarityAttractionUnlock() {
  if (!isNativeAndroid()) return true;
  return readStoredUnlockFlag();
}

/**
 * Query Play and update localStorage if the managed product is owned.
 */
export async function refreshPolarityAttractionEntitlementFromPlay() {
  if (!isNativeAndroid()) return;

  if (!playSyncPromise) {
    playSyncPromise = (async () => {
      try {
        const api = await getNativePurchasesApi();
        if (!api) return;
        const { NativePurchases, PURCHASE_TYPE } = api;
        const { isBillingSupported } = await NativePurchases.isBillingSupported();
        if (!isBillingSupported) return;

        const { purchases } = await NativePurchases.getPurchases({
          productType: PURCHASE_TYPE.INAPP
        });
        const list = purchases || [];
        const ok = list.some(transactionIsValidPurchase);
        setStoredUnlockFlag(ok);
      } catch {
        // keep cache; user can Restore purchases
      } finally {
        playSyncPromise = null;
      }
    })();
  }
  return playSyncPromise;
}

export async function purchasePolarityAttractionUnlock() {
  if (!isNativeAndroid()) return;
  try {
    const api = await getNativePurchasesApi();
    if (!api) {
      void showAlert('Billing is not available in this environment.');
      return;
    }
    const { NativePurchases, PURCHASE_TYPE } = api;
    const tx = await NativePurchases.purchaseProduct({
      productIdentifier: POLARITY_ATTRACTION_PRODUCT_ID,
      productType: PURCHASE_TYPE.INAPP,
      isConsumable: false,
      autoAcknowledgePurchases: true
    });
    if (transactionIsValidPurchase(tx)) {
      setStoredUnlockFlag(true);
      window.dispatchEvent(new CustomEvent('redpill-premium-changed'));
    }
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : String(e);
    if (!/cancel|canceled|cancelled|user/i.test(msg)) {
      void showAlert('Purchase could not be completed. Please try again or use Restore purchases.');
    }
  }
}

export async function restorePolarityAttractionPurchases() {
  if (!isNativeAndroid()) return;
  try {
    const api = await getNativePurchasesApi();
    if (!api) {
      void showAlert('Billing is not available in this environment.');
      return;
    }
    const { NativePurchases } = api;
    await NativePurchases.restorePurchases();
    await refreshPolarityAttractionEntitlementFromPlay();
    if (hasPolarityAttractionUnlock()) {
      window.dispatchEvent(new CustomEvent('redpill-premium-changed'));
      void showAlert('Purchases restored.');
    } else {
      void showAlert('No previous purchase found for this Google account.');
    }
  } catch {
    void showAlert('Restore failed. Check your Play Store account and try again.');
  }
}

function paywallButtonsWired() {
  return document.body?.dataset?.redpillPremiumPaywallWired === '1';
}

function markPaywallButtonsWired() {
  if (document.body) document.body.dataset.redpillPremiumPaywallWired = '1';
}

async function refreshPremiumProductPriceLine() {
  const el = document.getElementById('androidPremiumPaywallPrice');
  if (!el || !isNativeAndroid()) return;
  try {
    const api = await getNativePurchasesApi();
    if (!api) return;
    const { NativePurchases, PURCHASE_TYPE } = api;
    const { product } = await NativePurchases.getProduct({
      productIdentifier: POLARITY_ATTRACTION_PRODUCT_ID,
      productType: PURCHASE_TYPE.INAPP
    });
    if (product && product.priceString) {
      el.textContent = product.priceString;
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  } catch {
    el.textContent = '';
    el.hidden = true;
  }
}

/**
 * After suite prerequisite UI runs: add Android paywall + button lock when needed.
 * @param {'polarity' | 'attraction'} page
 * @param {{ polarityUnlocked?: boolean, attractionUnlocked?: boolean }} gate
 */
export async function applyAndroidPolarityAttractionPremiumUI(page, gate) {
  const paywall = document.getElementById('androidPremiumPaywall');
  const wrap = document.getElementById('actionButtonsWrap');
  const sample = document.getElementById('generateSampleReport');
  const start = document.getElementById('startAssessment');
  const descId = 'androidPremiumPaywallMessage';

  if (!isNativeAndroid()) {
    if (paywall) paywall.hidden = true;
    return;
  }

  await refreshPolarityAttractionEntitlementFromPlay();

  const suiteOk = page === 'polarity' ? gate.polarityUnlocked : gate.attractionUnlocked;
  const needsPremium = !hasPolarityAttractionUnlock();

  if (!suiteOk) {
    if (paywall) paywall.hidden = true;
    return;
  }

  if (!paywallButtonsWired()) {
    const unlockBtn = document.getElementById('androidPremiumUnlockBtn');
    const restoreBtn = document.getElementById('androidPremiumRestoreBtn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        void purchasePolarityAttractionUnlock().then(() =>
          applyAndroidPolarityAttractionPremiumUI(page, getStageGateState())
        );
      });
    }
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        void restorePolarityAttractionPurchases().then(() =>
          applyAndroidPolarityAttractionPremiumUI(page, getStageGateState())
        );
      });
    }
    markPaywallButtonsWired();
  }

  if (needsPremium) {
    if (paywall) paywall.hidden = false;
    void refreshPremiumProductPriceLine();
    if (wrap) wrap.classList.add('suite-action-locked');
    if (sample) {
      sample.setAttribute('aria-disabled', 'true');
      sample.setAttribute('aria-describedby', descId);
    }
    if (start) {
      start.setAttribute('aria-disabled', 'true');
      start.setAttribute('aria-describedby', descId);
    }
  } else {
    if (paywall) paywall.hidden = true;
    if (wrap) wrap.classList.remove('suite-action-locked');
    if (sample) {
      sample.removeAttribute('aria-disabled');
      sample.removeAttribute('aria-describedby');
    }
    if (start) {
      start.removeAttribute('aria-disabled');
      start.removeAttribute('aria-describedby');
    }
  }
}

export function premiumBlocksPolarityAttractionActions() {
  return isNativeAndroid() && !hasPolarityAttractionUnlock();
}

export async function assertPolarityAttractionPremiumOrAlert() {
  if (!isNativeAndroid()) return true;
  await refreshPolarityAttractionEntitlementFromPlay();
  if (hasPolarityAttractionUnlock()) return true;
  void showAlert(
    'Unlock Polarity and Attraction with a one-time purchase on Google Play, or tap Restore purchases if you already bought this.'
  );
  return false;
}
