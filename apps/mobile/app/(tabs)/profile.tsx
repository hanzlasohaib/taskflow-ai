import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useTheme } from "@/components/useTheme";
import { ApiError, getProfile, updateProfile, type Profile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { APP_URL } from "@/lib/config";
import { fonts, spacing } from "@/lib/theme";

export default function ProfileScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getProfile();
      setProfile(next);
      setName(next.name);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const next = await updateProfile({ name: name.trim() });
      setProfile(next);
      setInfo("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setLoggingOut(false);
    }
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
        <Text style={[styles.heading, { color: colors.foreground }]}>Profile</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{profile?.email}</Text>

        <View style={styles.form}>
          <TextField label="Name" value={name} onChangeText={setName} />
          {error ? <Text style={[styles.message, { color: colors.destructive }]}>{error}</Text> : null}
          {info ? <Text style={[styles.message, { color: colors.secondary }]}>{info}</Text> : null}
          <Button title="Save changes" loading={saving} onPress={() => void onSave()} />
          <Button
            title="Open TaskFlow web"
            variant="ghost"
            onPress={() => void WebBrowser.openBrowserAsync(`${APP_URL}/dashboard`)}
          />
          <Button title="Sign out" variant="danger" loading={loggingOut} onPress={() => void onLogout()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
