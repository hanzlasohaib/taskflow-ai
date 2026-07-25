import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/components/useTheme";
import { fonts, spacing } from "@/lib/theme";

export default function NotFoundScreen() {
  const colors = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Screen not found</Text>
        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          Go home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
  },
  link: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
});
