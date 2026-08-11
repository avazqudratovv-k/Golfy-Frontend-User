import React from "react";
import Sidebar from "./app/components/sidebar/Sidebar";
import "./css/App.css";

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="page-content">
        <h1>Golfy</h1>
      </div>
    </div>
  );
}

export default App;
