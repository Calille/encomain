import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { initGoogleSheetsIntegration } from "./utils/googleSheets";
import { initLanguage } from "./utils/i18n";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize Google Sheets integration
initGoogleSheetsIntegration();

// Initialize language system
initLanguage();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
