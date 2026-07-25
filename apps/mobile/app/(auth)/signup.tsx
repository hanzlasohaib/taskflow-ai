import * as WebBrowser from "expo-web-browser";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
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
import { AuthError } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { APP_URL } from "@/lib/config";
import { fonts, spacing } from "@/lib/theme";

export default function SignupScreen() {
  const colors = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setInfo(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({ name: name.trim(), email: email.trim(), password });
      if (result.user) {
        router.replace("/(tabs)");
        return;
      }
      setInfo("Check your email to verify, then sign in. Verification opens in the browser.");
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Unable to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.brand, { color: colors.primary }]}>TaskFlow</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Create your workspace.
        </Text>

        <View style={styles.form}>
          <TextField label="Name" value={name} onChangeText={setName} autoComplete="name" />
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Confirm password"
            secureTextEntry
            autoComplete="new-password"
            value={confirm}
            onChangeText={setConfirm}
          />
          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          {info ? <Text style={[styles.info, { color: colors.secondary }]}>{info}</Text> : null}
          <Button title="Create account" loading={loading} onPress={() => void onSubmit()} />
        </View>

        {info ? (
          <Pressable onPress={() => void WebBrowser.openBrowserAsync(`${APP_URL}/verify-email`)}>
            <Text style={[styles.link, { color: colors.primary }]}>Open verification page</Text>
          </Pressable>
        ) : null}

        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.mutedForeground }]}>
              Already have an account? <Text style={{ color: colors.primary }}>Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingTop: spacing.xxl,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  info: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  link: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
