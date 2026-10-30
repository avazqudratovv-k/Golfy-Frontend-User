import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAuth } from "./components/RouteGuards";
import HomePage from "./pages/HomePage";
import VenuesPage from "./pages/VenuesPage";
import VenuePage from "./pages/VenuePage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import BookingsPage from "./pages/BookingsPage";
import ReviewPage from "./pages/ReviewPage";
import ProfilePage from "./pages/ProfilePage";
import FavouritesPage from "./pages/FavouritesPage";
import AuthPage from "./pages/AuthPages";
import { ErrorBoundary, NotFoundPage } from "./pages/ErrorPages";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venues/:id" element={<VenuePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/checkout/:id" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/confirmation/:id" element={<RequireAuth><ConfirmationPage /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
          <Route path="/review/:bookingId" element={<RequireAuth><ReviewPage /></RequireAuth>} />
          <Route path="/favourites" element={<RequireAuth><FavouritesPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
