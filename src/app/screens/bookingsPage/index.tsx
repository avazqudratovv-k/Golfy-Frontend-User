import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { retrieveSelected } from "./selector";
import SelectedVenueItem from "./components/SelectedVenueItem";
import PaymentModal from "./components/PaymentModal";
import MyBookingsList from "./components/MyBookingsList";
import { SelectedBooking } from "./slice";
import "../../../css/bookingsPage.css";

export default function BookingsPage() {
  const selected = useSelector(retrieveSelected);
  const [payingBooking, setPayingBooking] = useState<SelectedBooking | null>(
    null,
  );

  return (
    <div className="bookings-page">
      <Typography className="page-intro">
        Manage your tee times and past rounds
      </Typography>

      <div className="selected-section">
        <h2>Selected Venues</h2>
        {selected.length === 0 ? (
          <p className="no-data">
            Nothing selected yet — book a venue from the Venues page.
          </p>
        ) : (
          selected.map((s) => (
            <SelectedVenueItem
              key={s.venue._id}
              booking={s}
              onPayClick={setPayingBooking}
            />
          ))
        )}
      </div>

      <MyBookingsList />

      <PaymentModal
        booking={payingBooking}
        onClose={() => setPayingBooking(null)}
      />
    </div>
  );
}
