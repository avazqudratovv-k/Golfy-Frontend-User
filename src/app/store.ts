import { configureStore } from "@reduxjs/toolkit";
import homePageReducer from "./screens/homePage/slice";
import venuesPageReducer from "./screens/venuesPage/slice";
import bookingsPageReducer from "./screens/bookingsPage/slice";

export const store = configureStore({
  reducer: {
    homePage: homePageReducer,
    venuesPage: venuesPageReducer,
    bookingsPage: bookingsPageReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;