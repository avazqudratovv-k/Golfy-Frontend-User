import React from "react";
import { useDispatch } from "react-redux";
import { Button, Typography } from "@mui/material";
import TimeSlotPicker from "./TimeSlotPicker";
import {
  updateSelectedTime,
  removeSelectedVenue,
  SelectedBooking,
} from "../slice";

interface Props {
  booking: SelectedBooking;
  onPayClick: (booking: SelectedBooking) => void;
}

export default function SelectedVenueItem({ booking, onPayClick }: Props) {
  const dispatch = useDispatch();

  const update = (
    patch: Partial<
      Pick<SelectedBooking, "bookingDate" | "startHour" | "endHour">
    >,
  ) => {
    dispatch(
      updateSelectedTime({
        venueId: booking.venue._id,
        bookingDate: patch.bookingDate ?? booking.bookingDate,
        startHour: patch.startHour ?? booking.startHour,
        endHour: patch.endHour ?? booking.endHour,
      }),
    );
  };

  const canPay =
    booking.bookingDate !== "" &&
    booking.startHour !== "" &&
    booking.endHour !== "";
  const duration = canPay
    ? Number(booking.endHour.split(":")[0]) -
      Number(booking.startHour.split(":")[0])
    : 0;
  const total = duration * booking.venue.pricePerHour;

  return (
    <div className="selected-item">
      <div className="selected-info">
        <Typography className="selected-title">
          {booking.venue.venueName}
        </Typography>
        <Typography className="selected-location">
          {booking.venue.venueLocation}
        </Typography>
        <Typography className="selected-price">
          ${booking.venue.pricePerHour}/hr
        </Typography>
        {canPay && duration > 0 && (
          <Typography className="selected-total">
            {duration} hr{duration > 1 ? "s" : ""} · Total: ${total}
          </Typography>
        )}
      </div>
      <TimeSlotPicker
        date={booking.bookingDate}
        startHour={booking.startHour}
        endHour={booking.endHour}
        onDateChange={(d) => update({ bookingDate: d })}
        onStartChange={(h) => update({ startHour: h })}
        onEndChange={(h) => update({ endHour: h })}
      />
      <div className="selected-actions">
        <Button
          onClick={() => dispatch(removeSelectedVenue(booking.venue._id))}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          disabled={!canPay || duration <= 0}
          onClick={() => onPayClick(booking)}
        >
          Pay
        </Button>
      </div>
    </div>
  );
}
