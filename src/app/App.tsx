import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import HomePage from "./screens/homePage";
import VenuesPage from "./screens/venuesPage";
import BookingsPage from "./screens/bookingsPage";
import MyPage from "./screens/myPage";
import HelpPage from "./screens/helpPage";
import AuthPage from "./screens/authPage";
import Footer from "./components/footer/Footer";
import "./css/App.css";
import "./css/footer.css";

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="page-content">
        <main className="main-body">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
