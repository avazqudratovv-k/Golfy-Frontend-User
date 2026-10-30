import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthContext";
import { ToastProvider } from "./app/context/ToastContext";
import { FavoritesProvider } from "./app/context/FavoritesContext";
import App from "./app/App";
import "./css/golfy.css";
import "./css/app.css";
import "./css/motion.css";
import "./css/hero.css";
import "./css/auth.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
