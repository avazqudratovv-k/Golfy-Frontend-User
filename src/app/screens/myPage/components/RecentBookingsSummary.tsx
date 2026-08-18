import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { retrieveRecentBookings } from "../selector";
import { setRecentBookings } from "../slice";
import BookingService from "../../../services/BookingService";

export default function RecentBookingsSummary() {
  const dispatch = useDispatch();
  const bookings = useSelector(retrieveRecentBookings);

  useEffect(() => {
    const fetch = async () => {
      try {
        const bookingService = new BookingService();
        const result = await bookingService.getMyBookings();
        dispatch(setRecentBookings(result.slice(0, 3)));
      } catch (err) {
        console.log("Error fetching recent bookings:", err);
      }
    };
    fetch();
  }, [dispatch]);

  return (
    <div className="recent-bookings-summary">
      <Typography className="section-title">Recent Bookings</Typography>
      {bookings.length === 0 ? (
        <Typography className="no-data">No bookings yet.</Typography>
      ) : (
        bookings.map((b: any) => {
          const venue = b.venueData?.[0];
          return (
            <div key={b._id} className="summary-item">
              <Typography className="summary-venue">
                {venue?.venueName}
              </Typography>
              <Typography className="summary-detail">
                {new Date(b.bookingDate).toLocaleDateString()} · {b.startTime} ·{" "}
                {b.status}
              </Typography>
            </div>
          );
        })
      )}
    </div>
  );
}
