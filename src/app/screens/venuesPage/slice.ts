import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "../../lib/types/venue";

interface VenuesPageState {
  venues: Venue[];
  search: string;
  sort: "cheap" | "expensive" | "popular";
  page: number;
  loading: boolean;
}

const initialState: VenuesPageState = {
  venues: [],
  search: "",
  sort: "cheap",
  page: 1,
  loading: false,
};

const venuesPageSlice = createSlice({
  name: "venuesPage",
  initialState,
  reducers: {
    setVenues: (state, action: PayloadAction<Venue[]>) => {
      state.venues = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<"cheap" | "expensive" | "popular">) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setVenues, setSearch, setSort, setPage, setLoading } = venuesPageSlice.actions;
export default venuesPageSlice.reducer;
