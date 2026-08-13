import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import HomePage from "./screens/homePage/index";
import VenuesPage from "./screens/venuesPage/index";
import BookingsPage from "./screens/bookingsPage/index";
import MyPage from "./screens/myPage/index";
import HelpPage from "./screens/helpPage/index";
import AuthPage from "./screens/authPage/index";
import "./css/App.css";

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/my-page" element={<MyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
