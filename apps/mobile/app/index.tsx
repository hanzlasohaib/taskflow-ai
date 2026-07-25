import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useTheme } from "@/components/useTheme";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
  const { user, loading } = useAuth();
  const colors = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
