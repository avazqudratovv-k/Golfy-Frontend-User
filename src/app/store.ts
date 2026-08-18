import { configureStore } from "@reduxjs/toolkit";
import homePageReducer from "./screens/homePage/slice";
import venuesPageReducer from "./screens/venuesPage/slice";
import bookingsPageReducer from "./screens/bookingsPage/slice";
import helpPageReducer from "./screens/helpPage/slice";
import myPageReducer from "./screens/myPage/slice";

export const store = configureStore({
  reducer: {
    homePage: homePageReducer,
    venuesPage: venuesPageReducer,
    bookingsPage: bookingsPageReducer,
    helpPage: helpPageReducer,
    myPage: myPageReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;