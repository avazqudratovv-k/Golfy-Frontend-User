import { RootState } from "../../store";
export const retrieveProfile = (state: RootState) => state.myPage.profile;
export const retrieveRecentBookings = (state: RootState) => state.myPage.recentBookings;