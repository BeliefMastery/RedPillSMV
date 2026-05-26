import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import supernovaBackdrop from "@site/images/SupernovaBLUE.jpg?url";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/backdrop.css";
import "./styles/home.css";
import "./styles/engine-assessment.css";
import "./styles/engine-options.css";
import "./styles/legacy-compat.css";

document.documentElement.style.setProperty(
  "--v3-backdrop-art-url",
  `url("${supernovaBackdrop}")`
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
