import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "./app/store";
import ContextProvider from "./app/context/contextProvider";
import "./css/index.css";
import App from "./App";

const container = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ContextProvider>
        <Router>
          <App />
        </Router>
      </ContextProvider>
    </Provider>
  </React.StrictMode>,
);
