import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { Alert } from "react-native";

const errorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as { data?: { error?: string; message?: string } };
    const message = payload.data?.error || payload.data?.message || "Please try again.";
    Alert.alert("Something went wrong", message);
  }
  return next(action);
};

export default errorLogger;
