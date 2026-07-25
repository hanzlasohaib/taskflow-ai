import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { useTheme } from "@/components/useTheme";
import { useAuth } from "@/lib/auth-context";
import { darkColors, lightColors } from "@/lib/theme";

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const colors = useTheme();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? darkColors : lightColors;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.foreground,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen name="signup" options={{ title: "Sign up" }} />
    </Stack>
  );
}
