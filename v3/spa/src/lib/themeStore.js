const THEME_KEY = "bm_site_theme";
const LEGACY_KEY = "redpill-style-overlay";

const THEMES = ["light", "forge"];

const LEGACY_MAP = {
  default: "light",
  cosmic: "light",
  earth: "light",
  light: "light",
  forge: "forge",
  dark: "forge",
  neomorphism: "light",
};

export function getThemes() {
  return THEMES;
}

export function getTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && LEGACY_MAP[stored]) return LEGACY_MAP[stored];
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && LEGACY_MAP[legacy]) return LEGACY_MAP[legacy];
  } catch {
    /* ignore */
  }
  return "light";
}

export function setTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "light";
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
