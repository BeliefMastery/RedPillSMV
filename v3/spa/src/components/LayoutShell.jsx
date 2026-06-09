import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  applyThemeToDocument,
  getTheme,
  getThemes,
  migrateLegacyTheme,
  setTheme,
} from "../lib/themeStore.js";
import { SuiteGateProvider } from "../context/SuiteGateContext.jsx";
import SeoHead from "./SeoHead.jsx";
import TopNav from "./TopNav.jsx";
import BottomNav from "./BottomNav.jsx";
import SiteFooter from "./SiteFooter.jsx";

function LayoutShellInner() {
  const [theme, setThemeState] = useState(getTheme);
  const location = useLocation();

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
      {location.pathname === "/" && <SiteFooter />}
    </div>
  );
}

export default function LayoutShell() {
  return (
    <SuiteGateProvider>
      <LayoutShellInner />
    </SuiteGateProvider>
  );
}
