import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { initPageErrorReporter } from "@site/shared/page-error-reporter.js";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/backdrop.css";
import "./styles/home.css";
import "./styles/engine-assessment.css";
import "./styles/engine-options.css";
import "./styles/legacy-compat.css";

function applyBackdropArt() {
  import("@site/images/SupernovaBLUE.jpg?url").then(({ default: url }) => {
    document.documentElement.style.setProperty(
      "--v3-backdrop-art-url",
      `url("${url}")`
    );
  });
}

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(applyBackdropArt);
  } else {
    window.addEventListener("load", applyBackdropArt, { once: true });
  }
}

initPageErrorReporter();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
