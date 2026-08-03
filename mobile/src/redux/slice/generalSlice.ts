import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type GeneralState = { isOnboarded: boolean; isGuest: boolean };
const initialState: GeneralState = { isOnboarded: false, isGuest: false };

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      state.isOnboarded = action.payload;
    },
    setGuest: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
    },
  },
});

export const { setGuest, setOnboarded } = generalSlice.actions;
export default generalSlice.reducer;
