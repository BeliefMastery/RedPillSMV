import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navItems } from "../routes.js";
import { useSuiteGates } from "../hooks/useSuiteGates.js";

export default function TopNav({ theme, themes, onThemeChange }) {
  const { isLocked } = useSuiteGates();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" role="banner">
      <nav className="nav" aria-label="Primary navigation">
        <button
          type="button"
          className="hamburger"
          aria-expanded={open}
          aria-controls="top-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <ul className={`nav-list${open ? " active" : ""}`} id="top-nav" role="menubar">
          {navItems.map((item) => {
            const locked = isLocked(item.path);
            if (locked) {
              return (
                <li key={item.path} role="none">
                  <span
                    className="suite-progress-link--locked"
                    title={locked}
                    style={{ padding: "0.35rem 0.5rem" }}
                  >
                    {item.label}
                  </span>
                </li>
              );
            }
            return (
              <li key={item.path} role="none">
                <NavLink
                  role="menuitem"
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <label style={{ marginLeft: "auto", fontSize: "0.85rem" }}>
          <span className="visually-hidden">Theme</span>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            aria-label="Site theme"
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </nav>
    </header>
  );
}
