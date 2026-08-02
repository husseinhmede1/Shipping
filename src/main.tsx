import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts — faster and more private than Google's CDN.
import "@fontsource-variable/inter";
import "@fontsource-variable/inter-tight";

import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
