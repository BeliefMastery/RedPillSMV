import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/home.css";
import "./styles/engine-assessment.css";
import "./styles/legacy-compat.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
