# ServicePro — Technician App (Expo + TypeScript)

Production-ready Expo React Native source for the ServicePro technician app.
This first pass covers the **authentication, onboarding, registration and
verification** flow end to end.

## Run

```bash
cd mobile
npm install
npx expo install react-native-screens react-native-safe-area-context react-native-svg
npm run start
```

> `babel-plugin-module-resolver` powers the `@/` alias:
> `npm i -D babel-plugin-module-resolver`

## What's here

```
src/
  theme/        design tokens (colors light+dark, spacing 8pt grid, typography, radii, shadows)
  components/   Button, Card, Input, Chip, OtpInput, ProgressBar, StepHeader,
                UploadCard, StatusChip, Screen, EmptyState, Skeleton, Banner, Divider
  navigation/   RootNavigator + typed route params
  context/      AuthContext (session + application status state machine)
  data/         service categories, cities, onboarding slides
  screens/
    auth/         Splash, Onboarding, Welcome, Login, ForgotPassword,
                  OtpVerification, ResetPassword
    verification/ ApplicationSubmitted, WaitingApproval, Rejected, Approved
    registration/ 14-step wizard (personal → contact → professional → categories →
                  experience → areas → radius → CNIC → selfie → certificates →
                  trade license → emergency contact → bank → review & submit)
    main/         DashboardPlaceholder (next pass: Jobs, Calendar, Messages, Profile)
```

## Business rules implemented

- No dashboard access until `status === "approved"`.
- `submitted → pending → approved | rejected` gate is driven by `AuthContext`,
  and `RootNavigator` picks the stack from that status.
- Rejected technicians see the reason, the required corrections, and can
  re-upload documents and resubmit.
- `suspended` technicians reach the app but cannot go online; `blocked`
  technicians are stopped at login.

Use the dev shortcuts on the Waiting Approval screen to simulate admin decisions.
