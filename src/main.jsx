import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import heroLogo from "./assets/OPALgos GreyWhite Website.png";
import navLogo from "./assets/opal-gos.svg";

/** Preload LCP / first-paint images before React mounts (Vite-resolved URLs). */
function preloadImage(href, { fetchPriority = "high" } = {}) {
  if (typeof document === "undefined" || !href) return;
  if (document.querySelector(`link[rel="preload"][as="image"][href="${href}"]`)) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  if (fetchPriority) link.fetchPriority = fetchPriority;
  document.head.appendChild(link);
}

preloadImage(heroLogo, { fetchPriority: "high" });
preloadImage(navLogo, { fetchPriority: "high" });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
