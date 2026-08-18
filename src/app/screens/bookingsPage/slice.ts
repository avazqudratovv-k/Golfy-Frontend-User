import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "../../lib/types/venue";
import { Booking } from "../../lib/types/booking";

export interface SelectedBooking {
  venue: Venue;
  bookingDate: string;
  startHour: string;
  endHour: string;
}

interface BookingsPageState {
  selected: SelectedBooking[];
  myBookings: Booking[];
}

const initialState: BookingsPageState = {
  selected: [],
  myBookings: [],
};

const bookingsPageSlice = createSlice({
  name: "bookingsPage",
  initialState,
  reducers: {
    addSelectedVenue: (state, action: PayloadAction<Venue>) => {
      const exists = state.selected.find((s) => s.venue._id === action.payload._id);
      if (!exists) state.selected.push({ venue: action.payload, bookingDate: "", startHour: "", endHour: "" });
    },
    updateSelectedTime: (
      state,
      action: PayloadAction<{ venueId: string; bookingDate: string; startHour: string; endHour: string }>
    ) => {
      const item = state.selected.find((s) => s.venue._id === action.payload.venueId);
      if (item) {
        item.bookingDate = action.payload.bookingDate;
        item.startHour = action.payload.startHour;
        item.endHour = action.payload.endHour;
      }
    },
    removeSelectedVenue: (state, action: PayloadAction<string>) => {
      state.selected = state.selected.filter((s) => s.venue._id !== action.payload);
    },
    setMyBookings: (state, action: PayloadAction<Booking[]>) => {
      state.myBookings = action.payload;
    },
  },
});

export const { addSelectedVenue, updateSelectedTime, removeSelectedVenue, setMyBookings } =
  bookingsPageSlice.actions;
export default bookingsPageSlice.reducer;