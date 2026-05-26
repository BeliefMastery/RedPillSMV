const THEME_KEY = "bm_site_theme";
const LEGACY_KEY = "redpill-style-overlay";

const THEMES = ["earth", "light", "forge", "neomorphism"];

const LEGACY_MAP = {
  default: "earth",
  cosmic: "earth",
  earth: "earth",
  light: "light",
  forge: "forge",
  neomorphism: "neomorphism",
};

export function getThemes() {
  return THEMES;
}

export function getTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored)) return stored;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && LEGACY_MAP[legacy]) return LEGACY_MAP[legacy];
  } catch {
    /* ignore */
  }
  return "earth";
}

export function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "earth";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  applyThemeToDocument(next);
  return next;
}

export function migrateLegacyTheme() {
  try {
    if (localStorage.getItem(THEME_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && LEGACY_MAP[legacy]) {
      localStorage.setItem(THEME_KEY, LEGACY_MAP[legacy]);
    }
  } catch {
    /* ignore */
  }
}

export function applyThemeToDocument(theme) {
  const root = document.documentElement;
  for (const t of THEMES) {
    root.classList.remove(`theme-${t}`);
  }
  root.classList.add(`theme-${theme}`);
}
