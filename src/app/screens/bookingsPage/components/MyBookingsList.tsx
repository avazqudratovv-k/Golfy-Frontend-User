import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "@mui/material";
import { retrieveMyBookings } from "../selector";
import { setMyBookings } from "../slice";
import BookingService from "../../../services/BookingService";
import ReviewModal from "./ReviewModal";

export default function MyBookingsList() {
  const dispatch = useDispatch();
  const myBookings = useSelector(retrieveMyBookings);
  const [loading, setLoading] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const bookingService = new BookingService();
      const result = await bookingService.getMyBookings();
      dispatch(setMyBookings(result));
    } catch (err) {
      console.log("Error fetching my bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [dispatch]);

  const handleCancel = async (bookingId: string) => {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;
    try {
      const bookingService = new BookingService();
      await bookingService.updateBooking({
        bookingId,
        status: "CANCELLED" as any,
      });
      fetch();
    } catch (err) {
      console.log("Error cancelling booking:", err);
    }
  };

  if (loading)
    return (
      <Typography className="no-data">Loading your bookings...</Typography>
    );

  return (
    <div className="my-bookings-list">
      <Typography className="section-title">My Bookings</Typography>
      {myBookings.length === 0 ? (
        <Typography className="no-data">No bookings yet.</Typography>
      ) : (
        myBookings.map((b: any) => {
          const venue = b.venueData?.[0];

          // Update these two logic tracks right here:
          const cancellable = b.status === "PENDING"; // Can only cancel if unpaid/pending
          const reviewable = b.status === "CONFIRMED"; // Can review immediately after payment is confirmed

          return (
            <div key={b._id} className="my-booking-item">
              {/* Rest of your item JSX remains perfectly unchanged */}

              <div>
                <Typography className="booking-venue">
                  {venue?.venueName}
                </Typography>
                <Typography className="booking-detail">
                  {new Date(b.bookingDate).toLocaleDateString()} · {b.startTime}
                  –{b.endTime} · ${b.price}
                </Typography>
              </div>
              <div className="booking-right">
                <span
                  className={`status-badge status-${b.status.toLowerCase()}`}
                >
                  {b.status}
                </span>
                {cancellable && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleCancel(b._id)}
                  >
                    Cancel
                  </Button>
                )}
                {reviewable && (
                  <Button size="small" onClick={() => setReviewingBooking(b)}>
                    Leave a review
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}

      <ReviewModal
        booking={reviewingBooking}
        onClose={() => setReviewingBooking(null)}
        onSubmitted={() => {
          setReviewingBooking(null);
          fetch();
        }}
      />
    </div>
  );
}
