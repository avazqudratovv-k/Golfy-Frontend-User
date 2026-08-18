import { RootState } from "../../store";

export const retrieveSelected = (state: RootState) => state.bookingsPage.selected;
export const retrieveMyBookings = (state: RootState) => state.bookingsPage.myBookings;