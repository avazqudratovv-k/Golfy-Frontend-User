import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ReviewService from "../../../services/ReviewService";

interface Props {
  booking: any;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReviewModal({ booking, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!booking) return null;
  const venue = booking.venueData?.[0];

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const reviewService = new ReviewService();
      await reviewService.createReview({
        bookingId: booking._id,
        venueId: venue._id,
        rating: rating || 5,
        comment,
      });
      onSubmitted();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Review {venue?.venueName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1, minWidth: 300 }}>
          <Rating value={rating} onChange={(_, v) => setRating(v)} />
          <TextField
            label="Your review"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Stack direction="row" spacing={2}>
            <Button onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
