import { NavLink } from "react-router-dom";
import { useSuiteGates } from "../hooks/useSuiteGates.js";

const items = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/engines/archetype", label: "Archetype", icon: "◇" },
  { path: "/engines/polarity", label: "Polarity", icon: "◈" },
  { path: "/engines/attraction", label: "Attraction", icon: "◆" },
  { path: "/engines/relationship", label: "Relationships", icon: "⬡" },
];

export default function BottomNav() {
  const { isLocked } = useSuiteGates();

  return (
    <nav className="bottom-nav" aria-label="App navigation">
      {items.map((item) => {
        const lock = isLocked(item.path);
        if (lock) {
          return (
            <span
              key={item.path}
              className="bottom-nav-item"
              title={lock}
              style={{ opacity: 0.45 }}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </span>
          );
        }
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
