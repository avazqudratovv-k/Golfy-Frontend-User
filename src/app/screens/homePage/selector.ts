import { RootState } from "../../store";

export const retrieveTopVenues = (state: RootState) => state.homePage.topVenues;
export const retrieveStats = (state: RootState) => state.homePage.stats;
