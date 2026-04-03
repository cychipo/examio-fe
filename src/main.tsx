import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { AppProviders } from "@/provider/AppProviders";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <div className="min-h-screen [&::-webkit-scrollbar]:w-2">
        <App />
      </div>
    </AppProviders>
  </StrictMode>,
);
