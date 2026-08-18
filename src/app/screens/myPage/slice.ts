import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../lib/types/user";
import { Booking } from "../../lib/types/booking";

interface MyPageState {
  profile: User | null;
  recentBookings: Booking[];
}

const initialState: MyPageState = { profile: null, recentBookings: [] };

const myPageSlice = createSlice({
  name: "myPage",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    setRecentBookings: (state, action: PayloadAction<Booking[]>) => {
      state.recentBookings = action.payload;
    },
  },
});

export const { setProfile, setRecentBookings } = myPageSlice.actions;
export default myPageSlice.reducer;