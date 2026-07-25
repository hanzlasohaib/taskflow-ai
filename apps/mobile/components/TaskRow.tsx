import type { Task } from "@taskflow/types";
import { getDisplayStatusLabel, TASK_PRIORITY_LABELS } from "@taskflow/utils";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts, radius, spacing } from "@/lib/theme";

import { useTheme } from "./useTheme";

type Props = {
  task: Task;
  onPress: () => void;
};

export function TaskRow({ task, onPress }: Props) {
  const colors = useTheme();
  const statusLabel = getDisplayStatusLabel({ status: task.status, dueDate: task.dueDate });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={[styles.priority, { color: colors.primary }]}>
          {TASK_PRIORITY_LABELS[task.priority]}
        </Text>
      </View>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>{statusLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radius.panel,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
  priority: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
});
