import { RootState } from "../../store";
export const retrieveSubmitted = (state: RootState) => state.helpPage.submitted;
export const retrieveError = (state: RootState) => state.helpPage.error;