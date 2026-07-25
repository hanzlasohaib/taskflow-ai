import type { TaskPriority } from "@taskflow/types";
import { TASK_PRIORITY_LABELS } from "@taskflow/utils";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
import { ApiError, createTask, transcribeVoice } from "@/lib/api";
import { fonts, radius, spacing } from "@/lib/theme";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CreateScreen() {
  const colors = useTheme();
  const router = useRouter();
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    return () => {
      void recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, []);

  async function startRecording() {
    setError(null);
    setInfo(null);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission is required for voice capture.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: next } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = next;
      setRecording(true);
    } catch {
      setError("Unable to start recording.");
    }
  }

  async function stopRecordingAndTranscribe() {
    setRecording(false);
    const active = recordingRef.current;
    recordingRef.current = null;
    if (!active) return;

    setTranscribing(true);
    setError(null);
    try {
      await active.stopAndUnloadAsync();
      const uri = active.getURI();
      if (!uri) {
        setError("Recording failed — no audio file.");
        return;
      }

      const result = await transcribeVoice(uri, "audio/mp4");
      setTitle(result.suggestedTitle || result.transcript.slice(0, 80));
      if (result.suggestedDescription) {
        setDescription(result.suggestedDescription);
      } else if (result.transcript) {
        setDescription(result.transcript);
      }
      setInfo("Voice transcribed — review and save when ready.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Voice transcription failed");
    } finally {
      setTranscribing(false);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => undefined);
    }
  }

  async function onSave() {
    setError(null);
    setInfo(null);
    setSaving(true);
    try {
      const task = await createTask({
        title: title.trim(),
        description: description.trim() || null,
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      router.push(`/task/${task.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: colors.foreground }]}>New task</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Type details or capture with voice.
        </Text>

        <View style={styles.form}>
          <TextField label="Title" value={title} onChangeText={setTitle} />
          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ minHeight: 100, textAlignVertical: "top", paddingTop: spacing.md }}
          />

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
                      backgroundColor: active ? colors.primary : colors.muted,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.primaryForeground : colors.foreground,
                      fontFamily: fonts.bodyMedium,
                      fontSize: 13,
                    }}
                  >
                    {TASK_PRIORITY_LABELS[item]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={[styles.message, { color: colors.destructive }]}>{error}</Text> : null}
          {info ? <Text style={[styles.message, { color: colors.secondary }]}>{info}</Text> : null}

          <Button
            title={recording ? "Stop & transcribe" : transcribing ? "Transcribing…" : "Record voice"}
            variant="secondary"
            loading={transcribing}
            onPress={() => void (recording ? stopRecordingAndTranscribe() : startRecording())}
          />
          <Button title="Save task" loading={saving} onPress={() => void onSave()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  form: {
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
});
