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

export default function LoginScreen() {
  const colors = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Unable to sign in");
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
          Sign in to manage tasks on the go.
        </Text>

        <View style={styles.form}>
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
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          <Button title="Sign in" loading={loading} onPress={() => void onSubmit()} />
        </View>

        <Pressable onPress={() => void WebBrowser.openBrowserAsync(`${APP_URL}/forgot-password`)}>
          <Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text>
        </Pressable>

        <Link href="/(auth)/signup" asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.mutedForeground }]}>
              Need an account? <Text style={{ color: colors.primary }}>Sign up</Text>
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
  link: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
