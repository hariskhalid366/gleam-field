import Constants from "expo-constants";

const appConfig = Constants.expoConfig?.extra as
    { apiUrl?: string; useMockData?: boolean | string } | undefined;

export const BASE_URL = appConfig?.apiUrl || "http://localhost:4000/api";
export const USE_MOCK_DATA = appConfig?.useMockData !== false && appConfig?.useMockData !== "false";
