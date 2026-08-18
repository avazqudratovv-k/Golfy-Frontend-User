import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HelpPageState {
  submitted: boolean;
  error: string;
}

const initialState: HelpPageState = { submitted: false, error: "" };

const helpPageSlice = createSlice({
  name: "helpPage",
  initialState,
  reducers: {
    setSubmitted: (state, action: PayloadAction<boolean>) => {
      state.submitted = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setSubmitted, setError } = helpPageSlice.actions;
export default helpPageSlice.reducer;
