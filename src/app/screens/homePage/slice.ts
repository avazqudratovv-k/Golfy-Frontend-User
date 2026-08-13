import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "../../lib/types/venue";

interface Stats {
  totalBookings: number;
  totalVenues: number;
  totalUsers: number;
}

interface HomePageState {
  topVenues: Venue[];
  stats: Stats;
}

const initialState: HomePageState = {
  topVenues: [],
  stats: { totalBookings: 0, totalVenues: 0, totalUsers: 0 },
};

const homePageSlice = createSlice({
  name: "homePage",
  initialState,
  reducers: {
    setTopVenues: (state, action: PayloadAction<Venue[]>) => {
      state.topVenues = action.payload;
    },
    setStats: (state, action: PayloadAction<Stats>) => {
      state.stats = action.payload;
    },
  },
});

export const { setTopVenues, setStats } = homePageSlice.actions;
export default homePageSlice.reducer;