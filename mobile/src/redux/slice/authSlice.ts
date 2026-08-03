import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../Apis/Auth";
import type { AuthState, User } from "../../helpers/types";

const initialState: AuthState = { user: null, token: null, isAuthenticated: false, verificationStatus: "none" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.verificationStatus = "none";
    },
    setVerificationStatus: (state, action: PayloadAction<NonNullable<AuthState["verificationStatus"]>>) => { state.verificationStatus = action.payload; },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token);
    });
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { logout, restoreSession, updateUser, setVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
