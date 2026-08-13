import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "../../lib/types/venue";
import { Review } from "../../lib/types/review";

interface Stats {
  totalBookings: number;
  totalVenues: number;
  totalUsers: number;
}

interface HomePageState {
  topVenues: Venue[];
  stats: Stats;
  recentReviews: Review[];
}

const initialState: HomePageState = {
  topVenues: [],
  stats: { totalBookings: 0, totalVenues: 0, totalUsers: 0 },
  recentReviews: [],
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
    setRecentReviews: (state, action: PayloadAction<Review[]>) => {
      state.recentReviews = action.payload;
    },
  },
});

export const { setTopVenues, setStats, setRecentReviews } = homePageSlice.actions;
export default homePageSlice.reducer;