import type { TaskStats } from "@taskflow/types";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { StatCard } from "@/components/StatCard";
import { useTheme } from "@/components/useTheme";
import { ApiError, getTaskStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTaskRealtime } from "@/lib/realtime";
import { fonts, spacing } from "@/lib/theme";

export default function DashboardScreen() {
  const colors = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const next = await getTaskStats();
      setStats(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useTaskRealtime(user?.id, () => {
    void load(true);
  });

  if (loading && !stats) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />
      }
    >
      <Text style={[styles.greeting, { color: colors.foreground }]}>
        Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>Your task overview</Text>

      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

      <View style={styles.grid}>
        <StatCard label="Total" value={stats?.total ?? 0} />
        <StatCard label="Todo" value={stats?.todo ?? 0} accent={colors.primary} />
        <StatCard label="In progress" value={stats?.inProgress ?? 0} accent={colors.secondary} />
        <StatCard label="Done" value={stats?.done ?? 0} accent={colors.success} />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} accent={colors.destructive} />
        <StatCard label="Done this week" value={stats?.completedThisWeek ?? 0} accent={colors.warning} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  greeting: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
