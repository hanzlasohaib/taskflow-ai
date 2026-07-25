import type { Task, TaskPriority, TaskStatus } from "@taskflow/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@taskflow/utils";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { TaskRow } from "@/components/TaskRow";
import { useTheme } from "@/components/useTheme";
import { ApiError, listTasks } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTaskRealtime } from "@/lib/realtime";
import { fonts, radius, spacing } from "@/lib/theme";

const STATUS_FILTERS: Array<TaskStatus | "ALL"> = ["ALL", "TODO", "IN_PROGRESS", "DONE", "ARCHIVED"];
const PRIORITY_FILTERS: Array<TaskPriority | "ALL"> = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TasksScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await listTasks({
          q: q.trim() || undefined,
          status: status === "ALL" ? undefined : status,
          priority: priority === "ALL" ? undefined : priority,
          pageSize: 50,
        });
        setTasks(result.items ?? []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [q, status, priority],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(handle);
  }, [load]);

  useTaskRealtime(user?.id, () => {
    void load(true);
  });

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search tasks"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.search,
            {
              color: colors.foreground,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
        />
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const active = status === item;
            return (
              <Pressable
                onPress={() => setStatus(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.primaryForeground : colors.foreground, fontFamily: fonts.bodyMedium, fontSize: 12 }}>
                  {item === "ALL" ? "All" : TASK_STATUS_LABELS[item]}
                </Text>
              </Pressable>
            );
          }}
        />
        <FlatList
          horizontal
          data={PRIORITY_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const active = priority === item;
            return (
              <Pressable
                onPress={() => setPriority(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.secondary : colors.muted,
                    borderColor: active ? colors.secondary : colors.border,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.secondaryForeground : colors.foreground, fontFamily: fonts.bodyMedium, fontSize: 12 }}>
                  {item === "ALL" ? "Any priority" : TASK_PRIORITY_LABELS[item]}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : null}

      {loading && tasks.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No tasks match these filters.</Text>
          }
          renderItem={({ item }) => (
            <TaskRow task={item} onPress={() => router.push(`/task/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filters: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  search: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  chips: {
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: {
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
  error: {
    fontFamily: fonts.body,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
