import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./app/components/sidebar/Sidebar";
import HomePage from "./app/screens/homePage";
import VenuesPage from "./app/screens/venuesPage";
import BookingsPage from "./app/screens/bookingsPage";
import MyPage from "./app/screens/myPage";
import HelpPage from "./app/screens/helpPage";
import AuthPage from "./app/screens/authPage";
import Footer from "./app/components/footer/Footer";
import "./css/App.css";
import "./css/footer.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <Sidebar />
      <div className="page-content">
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
