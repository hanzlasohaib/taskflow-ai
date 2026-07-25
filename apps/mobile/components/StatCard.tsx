import { StyleSheet, Text, View } from "react-native";

import { fonts, radius, spacing } from "@/lib/theme";

import { useTheme } from "./useTheme";

type Props = {
  label: string;
  value: number | string;
  accent?: string;
};

export function StatCard({ label, value, accent }: Props) {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.value, { color: accent ?? colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
});
