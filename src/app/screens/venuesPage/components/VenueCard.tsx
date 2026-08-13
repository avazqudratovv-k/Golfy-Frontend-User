import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Venue } from "../../../lib/types/venue";
import { serverApi } from "../../../lib/config";
import { addSelectedVenue } from "../../bookingsPage/slice";

interface Props {
  venue: Venue;
}

export default function VenueCard({ venue }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const imagePath = venue.venueImages?.[0]
    ? `${serverApi}/${venue.venueImages[0]}`
    : "/img/venue-placeholder.jpg";

  const handleBook = () => {
    dispatch(addSelectedVenue(venue));
    navigate("/bookings");
  };

  return (
    <Card className="venue-card">
      <CardMedia
        component="img"
        height="280"
        image={imagePath}
        alt={venue.venueName}
      />
      <CardContent>
        <Typography className="venue-title">{venue.venueName}</Typography>
        <Typography className="venue-location">
          {venue.venueLocation}
        </Typography>
        <Typography className="venue-price">
          ${venue.pricePerHour}/hr
        </Typography>
        <Button
          className="book-btn"
          variant="contained"
          fullWidth
          onClick={handleBook}
        >
          Book
        </Button>
      </CardContent>
    </Card>
  );
}
