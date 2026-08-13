import { RootState } from "../../store";

export const retrieveVenues = (state: RootState) => state.venuesPage.venues;
export const retrieveSearch = (state: RootState) => state.venuesPage.search;
export const retrieveSort = (state: RootState) => state.venuesPage.sort;
export const retrievePage = (state: RootState) => state.venuesPage.page;
export const retrieveLoading = (state: RootState) => state.venuesPage.loading;