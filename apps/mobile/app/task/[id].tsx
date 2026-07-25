import type { Sketch, Task, TaskPriority, TaskStatus } from "@taskflow/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@taskflow/utils";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useTheme } from "@/components/useTheme";
import { ApiError, deleteTask, getSketchForTask, getTask, updateTask } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import { fonts, radius, spacing } from "@/lib/theme";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"];
const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [task, setTask] = useState<Task | null>(null);
  const [sketch, setSketch] = useState<Sketch | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [nextTask, nextSketch] = await Promise.all([getTask(id), getSketchForTask(id)]);
      setTask(nextTask);
      setSketch(nextSketch);
      setTitle(nextTask.title);
      setDescription(nextTask.description ?? "");
      setStatus(nextTask.status);
      setPriority(nextTask.priority);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: task?.title ?? "Task" });
  }, [navigation, task?.title]);

  async function onSave() {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const next = await updateTask(id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
      });
      setTask(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleComplete() {
    if (!id) return;
    const nextStatus: TaskStatus = status === "DONE" ? "TODO" : "DONE";
    setSaving(true);
    try {
      const next = await updateTask(id, { status: nextStatus });
      setTask(next);
      setStatus(next.status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    if (!id) return;
    Alert.alert("Delete task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteTask(id);
              router.back();
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "Failed to delete task");
            }
          })();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={[styles.message, { color: colors.destructive }]}>{error}</Text> : null}

        <TextField label="Title" value={title} onChangeText={setTitle} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 100, textAlignVertical: "top", paddingTop: spacing.md }}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map((item) => {
            const active = status === item;
            return (
              <Pressable
                key={item}
                onPress={() => setStatus(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                  }}
                >
                  {TASK_STATUS_LABELS[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
        <View style={styles.chips}>
          {PRIORITIES.map((item) => {
            const active = priority === item;
            return (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.secondary : colors.muted,
                    borderColor: active ? colors.secondary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.secondaryForeground : colors.foreground,
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                  }}
                >
                  {TASK_PRIORITY_LABELS[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.sketchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sketchTitle, { color: colors.foreground }]}>Sketch</Text>
          {sketch?.imageUrl ? (
            <Image source={{ uri: sketch.imageUrl }} style={styles.sketchImage} resizeMode="contain" />
          ) : (
            <Text style={[styles.sketchBody, { color: colors.mutedForeground }]}>
              {sketch
                ? "A sketch exists for this task. Full editing is on the web app."
                : "No sketch yet. Create or edit sketches on the web app."}
            </Text>
          )}
          <Button
            title="Edit sketch on web"
            variant="ghost"
            onPress={() => void WebBrowser.openBrowserAsync(`${APP_URL}/tasks/${id}`)}
          />
        </View>

        <Button
          title={status === "DONE" ? "Mark incomplete" : "Mark complete"}
          variant="secondary"
          loading={saving}
          onPress={() => void onToggleComplete()}
        />
        <Button title="Save changes" loading={saving} onPress={() => void onSave()} />
        <Button title="Delete task" variant="danger" onPress={onDelete} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  sketchBox: {
    borderWidth: 1,
    borderRadius: radius.panel,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sketchTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
  sketchBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  sketchImage: {
    width: "100%",
    height: 180,
    borderRadius: radius.control,
  },
});
