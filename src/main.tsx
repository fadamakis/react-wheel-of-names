import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WheelOfNames from "./WheelOfNames";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WheelOfNames />
  </StrictMode>
);
