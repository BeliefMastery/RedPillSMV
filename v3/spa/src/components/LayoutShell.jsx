import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  applyThemeToDocument,
  getTheme,
  getThemes,
  migrateLegacyTheme,
  setTheme,
} from "../lib/themeStore.js";
import SeoHead from "./SeoHead.jsx";
import TopNav from "./TopNav.jsx";
import BottomNav from "./BottomNav.jsx";
import SiteFooter from "./SiteFooter.jsx";
import { useSuiteGates } from "../hooks/useSuiteGates.js";

export default function LayoutShell() {
  const [theme, setThemeState] = useState(getTheme);
  const location = useLocation();
  useSuiteGates();

  useEffect(() => {
    migrateLegacyTheme();
    applyThemeToDocument(getTheme());
    setThemeState(getTheme());
  }, []);

  const onThemeChange = (next) => {
    setTheme(next);
    setThemeState(next);
  };

  return (
    <div className="app">
      <SeoHead />
      <TopNav theme={theme} themes={getThemes()} onThemeChange={onThemeChange} />
      <main className="container" key={location.pathname}>
        <Outlet />
      </main>
      <BottomNav />
      <SiteFooter theme={theme} themes={getThemes()} onThemeChange={onThemeChange} />
    </div>
  );
}
