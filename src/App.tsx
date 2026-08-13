import React from "react";
import { Routes, Route } from "react-router-dom";

import "./css/App.css";
import Sidebar from "./app/components/sidebar/Sidebar";
import HomePage from "./app/screens/homePage/index";
import VenuesPage from "./app/screens/venuesPage/index";
import BookingsPage from "./app/screens/bookingsPage/index";
import MyPage from "./app/screens/myPage/index";
import HelpPage from "./app/screens/helpPage/index";
import AuthPage from "./app/screens/authPage/index";

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
