import { Platform, TextStyle, ViewStyle } from "react-native";

/** 8-point grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

const palette = {
  blue50: "#EFF6FF",
  blue100: "#DBEAFE",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  green50: "#ECFDF5",
  green600: "#059669",
  amber50: "#FFFBEB",
  amber600: "#D97706",
  red50: "#FEF2F2",
  red600: "#DC2626",
  white: "#FFFFFF",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate900: "#0F172A",
  slate950: "#020617",
};

export type ColorScheme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
};

export const lightColors: ColorScheme = {
  background: palette.slate50,
  surface: palette.white,
  surfaceAlt: palette.slate100,
  border: palette.slate200,
  text: palette.slate900,
  textMuted: palette.slate500,
  textInverse: palette.white,
  primary: palette.blue600,
  primaryPressed: palette.blue700,
  primarySoft: palette.blue50,
  success: palette.green600,
  successSoft: palette.green50,
  warning: palette.amber600,
  warningSoft: palette.amber50,
  danger: palette.red600,
  dangerSoft: palette.red50,
  overlay: "rgba(15,23,42,0.45)",
};

export const darkColors: ColorScheme = {
  background: palette.slate950,
  surface: "#0B1220",
  surfaceAlt: "#111C2E",
  border: "#1E293B",
  text: "#E2E8F0",
  textMuted: palette.slate400,
  textInverse: palette.white,
  primary: palette.blue500,
  primaryPressed: palette.blue600,
  primarySoft: "rgba(59,130,246,0.14)",
  success: "#34D399",
  successSoft: "rgba(52,211,153,0.14)",
  warning: "#FBBF24",
  warningSoft: "rgba(251,191,36,0.14)",
  danger: "#F87171",
  dangerSoft: "rgba(248,113,113,0.14)",
  overlay: "rgba(2,6,23,0.6)",
};

export const typography = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: "700" } as TextStyle,
  h1: { fontSize: 24, lineHeight: 32, fontWeight: "700" } as TextStyle,
  h2: { fontSize: 20, lineHeight: 28, fontWeight: "700" } as TextStyle,
  h3: { fontSize: 17, lineHeight: 24, fontWeight: "600" } as TextStyle,
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" } as TextStyle,
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "600" } as TextStyle,
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" } as TextStyle,
  overline: { fontSize: 11, lineHeight: 16, fontWeight: "700", letterSpacing: 0.8 } as TextStyle,
};

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0F172A",
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 2 },
    default: {},
  })!,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#0F172A",
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 6 },
    default: {},
  })!,
};

/** Minimum accessible touch target. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
export const TOUCH_TARGET = 48;
