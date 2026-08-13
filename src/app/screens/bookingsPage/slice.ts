import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "../../lib/types/venue";

interface BookingsPageState {
  selectedVenues: Venue[];
}

const initialState: BookingsPageState = {
  selectedVenues: [],
};

const bookingsPageSlice = createSlice({
  name: "bookingsPage",
  initialState,
  reducers: {
    addSelectedVenue: (state, action: PayloadAction<Venue>) => {
      const exists = state.selectedVenues.find((v) => v._id === action.payload._id);
      if (!exists) state.selectedVenues.push(action.payload);
    },
  },
});

export const { addSelectedVenue } = bookingsPageSlice.actions;
export default bookingsPageSlice.reducer;