import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { authApi } from "../Apis/Auth";
import { mmkvStorage } from "../../helpers/storage";
import errorLogger from "../../middlewares/apierror.middleware";
import successLogger from "../../middlewares/apisuccess.middleware";
import auth from "../slice/authSlice";
import general from "../slice/generalSlice";

const reducer = combineReducers({
  auth,
  general,
  [authApi.reducerPath]: authApi.reducer,
});

const persistedReducer = persistReducer(
  { key: "com.servicepro.technician", storage: mmkvStorage, whitelist: ["auth", "general"] },
  reducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(errorLogger, successLogger),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
