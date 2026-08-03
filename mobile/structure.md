# Application Architecture & Project Structure (`structure.md`)

This document outlines the architectural patterns, directory organization, state management design, and conventions used in this React Native project (**Graspra**).

---

## 1. Executive Summary & Tech Stack

This mobile application is built using React Native with TypeScript and strictly adheres to a **Separation of Concerns (SoC)** and **View-Controller Pattern** using custom React hooks.

* **Core Framework**: React Native with TypeScript
* **State Management**: Redux Toolkit (Slices) & Redux Persist (using MMKV engine)
* **Data Fetching & Caching**: RTK Query with modular API slices
* **Navigation**: React Navigation v6 (Native Stack, Drawer Navigator, Bottom Tab Navigator)
* **Form Handling & Validation**: Formik + Yup
* **Design System & Utilities**: Centralized Metrics (`metrics.ts`), Layout Wrappers, Reusable UI Components
* **Local Storage**: `react-native-mmkv`
* **Secure Storage**: `react-native-keychain`
* **Push Notifications**: Firebase Messaging + Notifee

---

## 2. Directory Tree Overview

```text
Graspra/
├── App.tsx                        # Root Application Entry Point (Providers, PersistGate, Services)
├── index.js                       # React Native Registry Entry
├── package.json                   # Project Dependencies & Scripts
├── react-native.config.js         # Asset Linking Configuration (Fonts, etc.)
├── tsconfig.json                  # TypeScript Compiler Configuration
└── src/                           # Main Application Source Code
    ├── assets/                    # Static Assets (Images, Fonts, Splash Screen)
    │   ├── bootsplash/
    │   ├── fonts/
    │   └── images/
    ├── components/                # Reusable UI Design System Components
    │   ├── AuthLayoutHeader/
    │   ├── BottomSheetModal/
    │   ├── Button/
    │   ├── CategoryCard/
    │   ├── CheckBox/
    │   ├── Header/
    │   ├── Input/
    │   ├── PageLoader/
    │   ├── SkeletonUi/
    │   ├── Text/
    │   └── ... (30+ atomic & composite components)
    ├── contexts/                  # React Contexts for UI/Global State
    │   └── ModalContext/
    ├── helpers/                   # Global Utilities, Theme & Helpers
    │   ├── colors.ts              # Theme Palette Constants
    │   ├── data.ts                # Helper Data & Device Utils
    │   ├── helper.ts              # General Helper Functions
    │   ├── metrics.ts             # Responsive Scaling (widthPixel, heightPixel, fontPixel)
    │   ├── navigation.ts          # Navigation Service (ref-based outside component navigation)
    │   ├── permissions.ts         # Native Permissions Requests
    │   ├── routes.tsx             # Navigation Route Constants & Screen Enums
    │   ├── storage.ts             # MMKV Storage Instance & Storage Wrappers
    │   ├── styles.ts              # Common Shared Styles
    │   └── types.ts               # Core TypeScript Interface Definitions
    ├── hooks/                     # Custom Utility Hooks
    │   ├── useDeviceToken.ts      # Push Notification / FCM Token Management
    │   ├── useImages.ts           # Dynamic Image Asset Resolver
    │   ├── useKeychain.ts         # Secure Credential Storage Operations
    │   └── useUserImage.ts        # Avatar / Profile Image Utilities
    ├── layouts/                   # Screen Container Layout Wrappers
    │   ├── AuthLayout/            # Layout Wrapper for Auth Screens
    │   ├── DrawerLayout/          # Layout Wrapper for Drawer Screens
    │   └── PrimaryLayout/         # Main Screen Container (Scrollable/Non-scrollable, Safe Areas)
    ├── middlewares/               # Custom Redux Middlewares
    │   ├── apierror.middleware.ts # Global API Error Logger & Interceptor
    │   └── apisuccess.middleware.ts # Global API Success Interceptor
    ├── navigation/                # Layered Navigation Structure
    │   ├── AppStackNavigator/     # Authenticated User Screen Stack
    │   ├── AuthStackNavigator/    # Authentication Screen Stack
    │   ├── BottomStackNavigator/  # Bottom Tab Navigation
    │   ├── DrawerStackNavigator/  # Drawer Navigation Hierarchy
    │   └── MainStackNavigator/    # Top-Level Root Navigator (Auth Routing Guard)
    ├── redux/                     # Redux Toolkit & Data Layer
    │   ├── Apis/                  # RTK Query Feature API Slices
    │   │   ├── Auth/              # Auth Endpoints (Login, Signup, Reset Password, etc.)
    │   │   ├── Category/          # Category API Endpoints
    │   │   ├── General/           # App Configuration & Global Config APIs
    │   │   ├── Notification/      # User Notifications APIs
    │   │   ├── Quiz/              # Quiz Attempt & Question APIs
    │   │   ├── Service/           # Core Application Services APIs
    │   │   ├── Subscription/      # Payment & Subscription Log APIs
    │   │   └── User/              # User Profile APIs
    │   ├── hook/                  # Typed Redux Hooks (useAppDispatch, useAppSelector)
    │   ├── slice/                 # Redux Slices (authSlice, generalSlice)
    │   └── store/                 # Store Configuration & Redux Persist Setup
    ├── screens/                   # Application Screens (Categorized by Domain)
    │   ├── Auth/                  # Unauthenticated Flow Screens
    │   │   ├── ForgotPassword/
    │   │   ├── Login/             # Example Screen: index.tsx + useLoginController.ts
    │   │   ├── Onboarding/
    │   │   ├── SetPassword/
    │   │   ├── Signup/
    │   │   └── VerifyCode/
    │   └── User/                  # Authenticated Flow Screens
    │       ├── AttemptQuiz/
    │       ├── Categories/
    │       ├── Home/              # Example Screen: index.tsx + useHomeController.ts
    │       ├── Profile/
    │       ├── QuizDetails/
    │       └── ... (17+ user screens)
    └── service/                   # Native Services & Push Handlers
        └── ManageNotificationService.ts # FCM Foreground & Background Handlers
```

---

## 3. Core Architectural Patterns

### A. View-Controller Pattern (Custom Hooks for Screen Logic)

To maintain a clean codebase, UI code (`JSX`) is decoupled from business logic, form validation, and side effects.

Every screen folder under `src/screens/<Domain>/<ScreenName>/` contains two primary files:

1. **`index.tsx` (View / Presentational Component)**
   * Responsible **only** for rendering the UI layout and UI components.
   * Does not contain `useState`, `useEffect`, direct API calls, or form validation rules.
   * Destructures state and callbacks from the screen's controller hook:
     ```tsx
     const ScreenName = () => {
       const { values, functions } = useScreenNameController();
       return <PrimaryLayout>{/* UI Elements */}</PrimaryLayout>;
     };
     ```

2. **`use<ScreenName>Controller.ts` (Controller Hook / Business Logic)**
   * Contains all state variables (`useState`), side-effects (`useEffect`), form handling (`useFormik` + `Yup`), RTK Query hooks, and navigation functions.
   * Exposes a structured return object partitioned into `values` and `functions`:
     ```typescript
     const useScreenNameController = () => {
       // 1. Redux & Router Hooks
       const dispatch = useAppDispatch();
       
       // 2. Local State & RTK Query
       const [data, setData] = useState([]);
       const [triggerApi, { isLoading }] = useApiMutation();

       // 3. Formik Form Setup
       const formik = useFormik({ ... });

       // 4. Action Handlers
       const handlePress = () => { ... };

       return {
         values: { formik, isLoading, data },
         functions: { handlePress },
       };
     };
     ```

---

### B. State Management & Data Layer Architecture

The application uses **Redux Toolkit** alongside **RTK Query** for caching and state persistence.

```
                  +------------------------+
                  |     React Components   |
                  +-----------+------------+
                              |
                     Trigger Actions / Hooks
                              v
        +----------------------------------------------+
        |                  Redux Store                 |
        |  +--------------------+  +----------------+  |
        |  |    Redux Slices    |  |   RTK Query    |  |
        |  | (auth, general)    |  |  (Auth, User)  |  |
        |  +---------+----------+  +-------+--------+  |
        +------------|---------------------|-----------+
                     |                     |
               Persist Engine         Middlewares
             (redux-persist +         (apierror,
                  MMKV)               apisuccess)
```

1. **Redux Slices (`src/redux/slice/`)**:
   * Stores global app state (e.g. user session token, authentication state in `authSlice.ts`, guest status in `generalSlice.ts`).
   * Configured with `redux-persist` and custom `mmkvStorage` for persistent storage across app restarts.

2. **RTK Query API Slices (`src/redux/Apis/`)**:
   * Divided by domain (`Auth`, `User`, `Quiz`, `Category`, etc.).
   * Base API configs inject authentication headers dynamically via state inspection.

3. **Global Middlewares (`src/middlewares/`)**:
   * `apierror.middleware.ts`: Intercepts API errors globally to show user notifications/toasts.
   * `apisuccess.middleware.ts`: Intercepts successful API mutations to trigger success feedback.

---

### C. Layered Navigation Hierarchy

Navigation is structured using React Navigation v6 in `src/navigation/`:

1. **`MainStackNavigator` (Root Gatekeeper)**:
   * Checks `isAuthenticated` and `isGuest` flags from Redux.
   * Conditionally mounts either `AuthStackNavigator` (if unauthenticated) or `DrawerStackNavigator` (if authenticated/guest).

2. **`DrawerStackNavigator` & `BottomStackNavigator`**:
   * Wraps the main application screens inside a customized drawer menu (`CustomDrawer`) and bottom navigation tabs.

3. **Ref-based Navigation Utility (`src/helpers/navigation.ts`)**:
   * Provides imperatively callable navigation functions (`navigate`, `goBack`, `reset`) outside React component boundaries (useful in controllers and middleware).

---

### D. Component System & Layout Abstraction

1. **Atomic & Reusable Components (`src/components/`)**:
   * Standardized basic UI blocks (`Button`, `Input`, `Text`, `CheckBox`, `Row`, `Touchable`) wrapped with application font types (`Urbanist`) and metrics.

2. **Layout Wrappers (`src/layouts/`)**:
   * `PrimaryLayout`: Standard wrapper for normal screens. Configures `SafeAreaView`, `StatusBar`, and optional header/scrolling containers.
   * `AuthLayout`: Standard wrapper for authentication screens featuring background illustrations and consistent padding.

3. **Responsive Metric Scaling (`src/helpers/metrics.ts`)**:
   * Screen dimensions are normalized using design baseline calculations:
     * `widthPixel(size)`: Scales horizontal dimensions based on screen width.
     * `heightPixel(size)`: Scales vertical dimensions based on screen height.
     * `fontPixel(size)`: Scales font sizes maintaining accessible typography ratios.

---

## 4. Developer Workflow: Adding a New Screen

To add a new screen (e.g., `QuizHistory`), follow this standardized template:

1. **Add Route Constant** in `src/helpers/routes.tsx`:
   ```typescript
   export const ROUTES = {
     ...
     QUIZ_HISTORY: 'QuizHistory',
   };
   ```

2. **Create Screen Folder**: `src/screens/User/QuizHistory/`

3. **Create Controller Hook** (`src/screens/User/QuizHistory/useQuizHistoryController.ts`):
   ```typescript
   import { useState } from 'react';

   const useQuizHistoryController = () => {
     const [history, setHistory] = useState([]);

     return {
       values: { history },
       functions: {},
     };
     };

   export default useQuizHistoryController;
   ```

4. **Create View Component** (`src/screens/User/QuizHistory/index.tsx`):
   ```tsx
   import React from 'react';
   import { View } from 'react-native';
   import PrimaryLayout from '../../../layouts/PrimaryLayout';
   import Text from '../../../components/Text';
   import useQuizHistoryController from './useQuizHistoryController';

   const QuizHistory = () => {
     const { values, functions } = useQuizHistoryController();

     return (
       <PrimaryLayout title="Quiz History">
         <Text>History count: {values.history.length}</Text>
       </PrimaryLayout>
     );
   };

   export default QuizHistory;
   ```

5. **Register Screen in Navigator** (`src/navigation/AppStackNavigator/index.tsx`):
   ```tsx
   <Stack.Screen name={ROUTES.QUIZ_HISTORY} component={QuizHistory} />
   ```
