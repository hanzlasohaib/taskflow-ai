import { darkColors, lightColors, type ThemeColors } from "@/lib/theme";

import { useColorScheme } from "./useColorScheme";

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
