import { configureStore } from "@reduxjs/toolkit";
import homePageReducer from "./screens/homePage/slice";

export const store = configureStore({
  reducer: {
    homePage: homePageReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;