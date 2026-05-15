import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WheelOfNames from "./WheelOfNames";
import "./styles/wheel-of-names.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WheelOfNames />
  </StrictMode>
);
