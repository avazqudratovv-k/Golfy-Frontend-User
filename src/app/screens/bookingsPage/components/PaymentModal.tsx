import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDispatch } from "react-redux";
import BookingService from "../../../services/BookingService";
import { removeSelectedVenue, setMyBookings, SelectedBooking } from "../slice";

interface Props {
  booking: SelectedBooking | null;
  onClose: () => void;
}

export default function PaymentModal({ booking, onClose }: Props) {
  const dispatch = useDispatch();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!booking) return null;

  const duration =
    Number(booking.endHour.split(":")[0]) -
    Number(booking.startHour.split(":")[0]);
  const total = duration * booking.venue.pricePerHour;

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const bookingService = new BookingService();
      const newBooking = await bookingService.createBooking({
        venueId: booking.venue._id,
        bookingDate: booking.bookingDate,
        startTime: booking.startHour,
        endTime: booking.endHour,
        price: total,
      });
      // ...rest unchanged

      await bookingService.updateBooking({
        bookingId: newBooking._id,
        status: "CONFIRMED" as any,
      });

      dispatch(removeSelectedVenue(booking.venue._id));
      const updated = await bookingService.getMyBookings();
      dispatch(setMyBookings(updated));
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    onClose();
  };

  if (success) {
    return (
      <Dialog open onClose={handleClose}>
        <DialogContent>
          <Box className="success-box">
            <CheckCircleIcon className="success-icon" />
            <Typography variant="h6">Thank you!</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Your booking at {booking.venue.venueName} is confirmed.
            </Typography>
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Pay for {booking.venue.venueName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1, minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary">
            {booking.bookingDate}, {booking.startHour}–{booking.endHour} · $
            {booking.venue.pricePerHour}/hr
          </Typography>
          <TextField
            label="Cardholder name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <TextField
            label="Card number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <TextField
              label="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </Stack>
          {error && <Typography color="error">{error}</Typography>}
          <Stack direction="row" spacing={2}>
            <Button onClick={handleClose} fullWidth>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePay}
              disabled={loading}
              fullWidth
            >
              {loading ? "Processing..." : "Pay"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
