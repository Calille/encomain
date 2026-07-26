import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { initGoogleSheetsIntegration } from "./utils/googleSheets";
import { initLanguage } from "./utils/i18n";
import { ThemeProvider } from "./contexts/ThemeContext";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

initGoogleSheetsIntegration();
initLanguage();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
