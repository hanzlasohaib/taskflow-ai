/**
 * TaskFlow mobile theme — aligned with frozen web tokens (apps/web/app/globals.css)
 * and PLAN §23 where practical on native.
 */

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  destructive: string;
  border: string;
  input: string;
  inputBackground: string;
  success: string;
  warning: string;
};

export const lightColors: ThemeColors = {
  background: "#F7F8FC",
  foreground: "#161628",
  card: "#FFFFFF",
  cardForeground: "#161628",
  primary: "#536DFE",
  primaryForeground: "#FFFFFF",
  secondary: "#00B8D4",
  secondaryForeground: "#FFFFFF",
  muted: "#F1F3FA",
  mutedForeground: "#667085",
  accent: "#00B8D4",
  destructive: "#EF4444",
  border: "#E4E7EC",
  input: "#E4E7EC",
  inputBackground: "#F7F8FC",
  success: "#22C55E",
  warning: "#F59E0B",
};

export const darkColors: ThemeColors = {
  background: "#040414",
  foreground: "#EEEEF8",
  card: "#0B0B1F",
  cardForeground: "#EEEEF8",
  primary: "#536DFE",
  primaryForeground: "#FFFFFF",
  secondary: "#00B8D4",
  secondaryForeground: "#FFFFFF",
  muted: "#161628",
  mutedForeground: "#A8ACC7",
  accent: "#00B8D4",
  destructive: "#EF4444",
  border: "rgba(255, 255, 255, 0.07)",
  input: "rgba(255, 255, 255, 0.05)",
  inputBackground: "#161628",
  success: "#22C55E",
  warning: "#F59E0B",
};

export const fonts = {
  display: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  body: "IBMPlexSans_400Regular",
  bodyMedium: "IBMPlexSans_500Medium",
  bodySemi: "IBMPlexSans_600SemiBold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  control: 8,
  panel: 12,
  card: 14,
} as const;
