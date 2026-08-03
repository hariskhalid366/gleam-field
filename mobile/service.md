# API Integration & Redux Service Architecture (`service.md`)

This document provides a comprehensive technical guide on how API calls are integrated with **Redux Toolkit Query (RTK Query)**, **Redux Toolkit Slices**, **Redux Persist (MMKV)**, **Global Interceptor Middlewares**, and **Native Services** in the **Graspra** mobile application.

---

## 1. Architecture Overview

The application follows a reactive, centralized data layer where all remote HTTP requests, caching, optimistic updates, and global application state are managed via Redux Toolkit and RTK Query.

```mermaid
flowchart TD
    subgraph UI Layer ["UI Layer (View Controllers)"]
        VC["Screen Controller Hook<br/>(e.g., useLoginController)"]
    end

    subgraph Redux Layer ["Redux Data & Cache Layer"]
        Store["Redux Store<br/>(configureStore)"]
        AuthSlice["authSlice<br/>(User, Token, Auth Status)"]
        GenSlice["generalSlice<br/>(Configs, Contents, Modes)"]
        
        subgraph RTK Query Slices
            AuthAPI["authApi"]
            UserAPI["userApi"]
            ServiceAPI["serviceApi"]
            GenAPI["generalApi"]
            CatAPI["categoryApi"]
            QuizAPI["quizApi"]
            NotifAPI["notificationApi"]
            SubAPI["subscriptionApi"]
        end
    end

    subgraph Middleware Pipeline ["Global Interceptor Pipeline"]
        ErrMW["errorLogger Middleware<br/>(Toast on rejected mutations/queries)"]
        SuccMW["successLogger Middleware<br/>(Toast on transformed success responses)"]
    end

    subgraph Native Storage & Services ["Storage & Service Layer"]
        MMKV["MMKV Engine<br/>(Redux Persist Storage)"]
        Notifee["ManageNotificationService<br/>(FCM & Notifee Notifications)"]
    end

    VC -->|Triggers Hook Mutation/Query| RTK Query Slices
    RTK Query Slices -->|Prepares Authorization Headers| Store
    AuthSlice -->|Provides Bearer Token| RTK Query Slices
    
    RTK Query Slices -->|Dispatches Actions| Middleware Pipeline
    Middleware Pipeline -->|Intercepts Fulfilled / Rejected| UI Toast
    
    RTK Query Slices -->|matchFulfilled ExtraReducers| AuthSlice
    RTK Query Slices -->|matchFulfilled ExtraReducers| GenSlice
    
    Store <-->|Persists Whitelisted Slices| MMKV
    Notifee -->|Foreground / Background Handlers| UI Toast
```

### Key Technical Pillars

1. **RTK Query Slices (`src/redux/Apis/`)**: Feature-specific API definitions built using `createApi` and `fetchBaseQuery`. Handles query execution, parameter serialization, base URL routing, and dynamic header injection.
2. **Redux Slices (`src/redux/slice/`)**: Global application state containers (`authSlice`, `generalSlice`) that listen to RTK Query actions via `extraReducers` and `addMatcher`.
3. **Persisted State (`src/redux/store/store.ts`)**: Uses `redux-persist` backed by `react-native-mmkv` (`mmkvStorage`) for ultra-fast, synchronous native storage of authentication credentials and application settings.
4. **Global Interceptor Middlewares (`src/middlewares/`)**: Intercepts all outgoing/incoming RTK Query dispatches to trigger UI toasts on success and failure without clogging UI view controllers with repetitive try/catch logic.
5. **Typed Redux Hooks (`src/redux/hook/hook.ts`)**: Pre-typed `useAppDispatch` and `useAppSelector` wrappers ensuring 100% type safety across components.

---

## 2. Redux Store Configuration & Persist Setup

Location: [store.ts](file:///Users/haris/Documents/Graspra/src/redux/store/store.ts)

The Redux store centralizes all 8 RTK Query API slice reducers alongside global application state slices.

### Store Architecture

```typescript
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "../slice/authSlice";
import generalreducer from "../slice/generalSlice";
import { mmkvStorage } from "../../helpers/storage";
import { authApi } from "../Apis/Auth";
import { userApi } from "../Apis/User";
import { serviceApi } from "../Apis/Service";
import { generalApi } from "../Apis/General";
import { categoryApi } from "../Apis/Category";
import { notificationApi } from "../Apis/Notification";
import errorLogger from "../../middlewares/apierror.middleware";
import successLogger from "../../middlewares/apisuccess.middleware";
import { quizApi } from "../Apis/Quiz";
import { subscriptionApi } from "../Apis/Subscription";

const rootReducer = combineReducers({
    auth: authReducer,
    general: generalreducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [generalApi.reducerPath]: generalApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
});

const persistConfig = {
    key: "com.pixelgenesys.graspra",
    storage: mmkvStorage,
    whitelist: ["auth", "general"], // Only persist auth credentials & general flags
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false, // Prevents non-serializable payload warnings for Redux Persist
        })
            .concat(authApi.middleware)
            .concat(userApi.middleware)
            .concat(serviceApi.middleware)
            .concat(generalApi.middleware)
            .concat(categoryApi.middleware)
            .concat(quizApi.middleware)
            .concat(notificationApi.middleware)
            .concat(subscriptionApi.middleware)
            .concat(errorLogger)
            .concat(successLogger),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 3. Dynamic Base Query & Authorization Injection

All API requests pass through `fetchBaseQuery` configured with standard base URLs and a dynamic header interceptor `prepareHeaders`.

### `prepareHeaders` Pattern

Before dispatching an HTTP request, `prepareHeaders` retrieves the active user Bearer token directly from the Redux state (`state.auth.token`). If present, it attaches `Authorization: Bearer <token>` and `Accept: application/json`.

```typescript
baseQuery: fetchBaseQuery({
  baseUrl: `${BASE_URL}/user/`,
  prepareHeaders: (headers, { getState }: any) => {
    const token = getState()?.auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
})
```

---

## 4. API Slices Catalog (`src/redux/Apis/`)

The application defines 8 specialized RTK Query slices corresponding to backend REST endpoints.

| API Slice | Reducer Path | Base URL Endpoint Path | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`authApi`** | `authApi` | `${BASE_URL}/user/` | Authentication, Signup, Social Logins, Password Reset, Profile Updates, Account Deletion |
| **`userApi`** | `userApi` | `${BASE_URL}/core/` | User History, Question Retrieval, Quiz & Category Fetching, Answer Submissions |
| **`serviceApi`** | `serviceApi` | `${BASE_URL}/service/` | Core App Services Retrieval & Favorite Toggling |
| **`categoryApi`** | `categoryApi` | `${BASE_URL}/core/` | App Categories listing, Category Detail views, User History |
| **`generalApi`** | `generalApi` | `${BASE_URL}/user/` | Project Environment Configs, Dynamic Content (Privacy Policy, Terms & Conditions) |
| **`quizApi`** | `quizApi` | `${BASE_URL}/core/` | Quiz Details, Quiz Modes, Questions per Mode/Quiz, Answer Submissions |
| **`notificationApi`** | `notificationApi` | `${BASE_URL}/core/` | Fetching User Notifications, Marking Notifications as Read |
| **`subscriptionApi`** | `subscriptionApi` | `${BASE_URL}/core/subscriptions` | Subscription Plans, In-App Purchase Processing, Subscription Audit Logs |

---

### API Endpoint Implementations

#### 1. Authentication API Slice ([Auth/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/Auth/index.ts))
Handles user identity and profile operations:
* **`login`** (`POST user_login`): User sign-in.
* **`register`** (`POST user_signup`): New user registration.
* **`socials`** (`POST user_social_login`): Google/Apple social sign-in.
* **`forgetPassword`** (`POST forgot_password`): Triggers password reset email. Uses `transformResponse` to set `meta.show_success = true` and custom message.
* **`verification`** (`POST user_verification_code`): Verifies OTP code.
* **`resendCode`** (`POST re_send_code`): Resends OTP code.
* **`updatePassword`** (`PUT update_password`): Password change for authenticated users.
* **`editProfile`** (`POST complete_profile`): Profile information update.
* **`deleteAccount`** (`POST delete_account`): Account deletion.
* **`logout`** (`POST logout`): User sign-out.

#### 2. User API Slice ([User/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/User/index.ts))
* **`getQuestion`** (`GET get_question/:id`): Fetches specific question data.
* **`getCategory`** (`GET get_category`): Fetches user categories with parameters.
* **`getQuiz`** (`GET get_quiz/:id`): Fetches specific quiz data.
* **`getMode`** (`GET get_mode/:id`): Fetches quiz execution modes.
* **`getHistory`** (`GET user_history`): Fetches user activity history.
* **`submitAnswer`** (`POST submit_answer/:id`): Submits quiz response.

#### 3. Service API Slice ([Service/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/Service/index.ts))
* **`getServices`** (`GET get` or `GET get/:id`): Fetches application services. Configured with `keepUnusedDataFor: 0` to disable stale cache retention when needed.
* **`handleFavorite`** (`POST favorite/:id`): Toggles favorite status for a service.

#### 4. Quiz API Slice ([Quiz/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/Quiz/index.ts))
* **`getQuiz`** (`GET get_quiz/:id`): Quiz details.
* **`getMode`** (`GET get_mode/:id`): Available quiz modes (Practice, Exam, etc.). Uses `keepUnusedDataFor: 0`.
* **`getQuestion`** (`GET get_question/:quiz_id/:mode`): Quiz questions filtered by mode.
* **`submitAnswer`** (`POST submit_answer`): Submits completed quiz answers.

#### 5. General API Slice ([General/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/General/index.ts))
* **`configs`** (`GET project_env/Abcd@1234`): Initial environment variables and system config flags.
* **`content`** (`GET content?type=...`): Retrieves terms of service, privacy policies, and CMS content typed by `CONTENT_TYPE`.

#### 6. Notification API Slice ([Notification/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/Notification/index.ts))
* **`getNotification`** (`GET notification`): Lists user push notifications.
* **`readNotification`** (`POST read/:id`): Marks notification as read.

#### 7. Subscription API Slice ([Subscription/index.ts](file:///Users/haris/Documents/Graspra/src/redux/Apis/Subscription/index.ts))
* **`getSubscriptionLogs`** (`GET get-log`): User subscription history.
* **`purchase`** (`POST subscribe/:id`): Initiates plan purchase.

---

## 5. Redux Slices & Synchronous State Management

Redux Toolkit Slices maintain global synchronous state. They listen to RTK Query actions via `extraReducers` matchers to automatically reflect network outcomes into local state without manual dispatching.

### 1. `authSlice` ([authSlice.ts](file:///Users/haris/Documents/Graspra/src/redux/slice/authSlice.ts))

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
```

* **Action Reducers**: `login`, `signUp`, `logout`, `updateUser`.
* **Automatic ExtraReducers Matchers**:
  * `authApi.endpoints.login.matchFulfilled`: Automatically saves `authorization` token, populates `user`, and sets `isAuthenticated = true`.
  * `authApi.endpoints.editProfile.matchFulfilled`: Updates active `user` profile state upon successful edit.
  * `authApi.endpoints.logout.matchFulfilled`: Clears `user`, `token`, and resets `isAuthenticated = false`.
  * `authApi.endpoints.deleteAccount.matchFulfilled`: Resets auth state to `null`.

### 2. `generalSlice` ([generalSlice.ts](file:///Users/haris/Documents/Graspra/src/redux/slice/generalSlice.ts))

```typescript
interface GeneralSlice {
  isOnboarded: boolean;
  isGuest: boolean;
  isActivePlan: boolean;
  configs: GeneralConfigs | null;
  contents: Partial<Record<CONTENT_TYPE, AppContent>>;
  modes: Mode[];
}
```

* **Action Reducers**: `onBoard`, `onGuest`, `setActivePlan`, `setConfigs`, `setModes`.
* **Automatic ExtraReducers Matchers**:
  * `REHYDRATE`: Ensures `contents` map is safely initialized after Redux Persist rehydrates.
  * `generalApi.endpoints.configs.matchFulfilled`: Populates global system `configs`.
  * `generalApi.endpoints.content.matchFulfilled`: Caches dynamic legal/CMS content by `CONTENT_TYPE`.
  * `quizApi.endpoints.getMode.matchFulfilled`: Populates global quiz `modes`.

---

## 6. Middleware Interceptors (Global Error & Success Handling)

Rather than placing repetitive toast triggers in every view controller, custom Redux middlewares intercept RTK Query dispatches globally.

### 1. API Error Interceptor ([apierror.middleware.ts](file:///Users/haris/Documents/Graspra/src/middlewares/apierror.middleware.ts))

Intercepts all rejected RTK Query requests (`isRejectedWithValue`), extracts the error message from the response payload, and displays a red error Toast.

```typescript
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const errorLogger: Middleware = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const message =
            (action as any)?.payload?.data?.message ||
            (action as any)?.error?.message ||
            "Something went wrong";

        console.log("Error Message :: ", message);
        Toast.show({ text1: "Error!", text2: message, type: "error" });
    }
    return next(action);
};

export default errorLogger;
```

### 2. API Success Interceptor ([apisuccess.middleware.ts](file:///Users/haris/Documents/Graspra/src/middlewares/apisuccess.middleware.ts))

Intercepts fulfilled requests (`isFulfilled`) containing explicit success flags (`meta.baseQueryMeta.show_success`) or API success messages and displays a green success Toast.

```typescript
import { isFulfilled, Middleware } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

const successLogger: Middleware = () => (next) => (action) => {
    if (isFulfilled(action)) {
        const show_success = (action as any)?.meta?.baseQueryMeta?.show_success;
        const message = (action as any)?.meta?.baseQueryMeta?.message || (action as any)?.payload?.message;

        if (show_success && message) {
            Toast.show({ text1: "Success!", text2: message, type: "success" });
        }
    }
    return next(action);
};

export default successLogger;
```

---

## 7. Native Push Notification Service

Location: [ManageNotificationService.ts](file:///Users/haris/Documents/Graspra/src/service/ManageNotificationService.ts)

Handles remote Firebase Cloud Messaging (FCM) and Notifee local notifications.

* **`requestUserPermission()`**: Requests iOS/Android notification authorizations and registers device for remote FCM tokens.
* **`displayNotification({ title, message })`**: Creates a high-priority Android notification channel (`default`) with vibration and displays local notification cards via Notifee.
* **`registerForegroundHandler()`**: Subscribes to incoming FCM messages when the application is running in the foreground and routes them to `displayNotification`.
* **`registerNotifeeForegroundHandler()`**: Handles user taps and dismissals on notification banners.

---

## 8. Integration Example: Connecting API & Redux in View Controllers

The View-Controller pattern isolates API calls inside custom screen hooks.

### Sample Screen Controller Hook (`useLoginController.ts`)

```typescript
import { useLoginMutation } from '../../../redux/Apis/Auth';
import { useAppDispatch } from '../../../redux/hook/hook';

export const useLoginController = () => {
  const [loginApi, { isLoading }] = useLoginMutation();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await loginApi(values).unwrap();
      // Token & user profile are automatically saved into authSlice via extraReducers!
      console.log('Login successful:', response);
    } catch (error) {
      // Error toast is automatically triggered by errorLogger middleware!
      console.log('Login failed:', error);
    }
  };

  return {
    isLoading,
    handleLogin,
  };
};
```

---

## 9. Developer Guidelines: Adding a New API Endpoint

When extending the application with a new endpoint (e.g., `getLeaderboard` in `User`), follow this checklist:

1. **Define Endpoint in API Slice** (`src/redux/Apis/User/index.ts`):
   ```typescript
   getLeaderboard: builder.query({
     query: (params) => ({
       url: 'leaderboard',
       method: 'GET',
       params,
     }),
   }),
   ```
2. **Export Generated RTK Query Hook**:
   ```typescript
   export const { useGetLeaderboardQuery } = userApi;
   ```
3. **Handle State Sync (If Applicable)**:
   If the response needs to update global synchronous state, add a matcher to the appropriate slice (`extraReducers` in `src/redux/slice/generalSlice.ts`):
   ```typescript
   builder.addMatcher(
     userApi.endpoints.getLeaderboard.matchFulfilled,
     (state, action) => {
       state.leaderboard = action.payload.data;
     }
   );
   ```
4. **Consume in Controller Hook**:
   Import `useGetLeaderboardQuery` directly into your controller hook. Loading, error, and caching states will be handled automatically by RTK Query.
