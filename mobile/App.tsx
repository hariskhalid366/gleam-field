import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { persistor, store } from "@/redux/store/store";

function Shell() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <AuthProvider><AppDataProvider><Shell /></AppDataProvider></AuthProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
