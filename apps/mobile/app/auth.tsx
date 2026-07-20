import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { signInWithApple, signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import {
  BrandWordmark,
  Body,
  DisplayTitle,
  Kicker,
  OutlineButton,
  PrimaryButton,
  SoftOrbs,
} from "@/components/ui";
import { colors, fonts, radius, space } from "@/src/theme";

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
  }, []);

  if (session === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  if (session) return <Redirect href="/(app)/today" />;

  async function handleEmail() {
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email.trim(), password, name.trim());
        Alert.alert("Check your email", "Confirm your address to finish signup.");
      } else {
        await signInWithEmail(email.trim(), password);
        trackEvent("auth_sign_in", { method: "email" });
        router.replace("/(app)/today");
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      trackEvent("auth_sign_in", { method: "google" });
      router.replace("/(app)/today");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setLoading(true);
    try {
      await signInWithApple();
      trackEvent("auth_sign_in", { method: "apple" });
      router.replace("/(app)/today");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Apple sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <SoftOrbs />
      <View style={styles.content}>
        <BrandWordmark size="md" />
        <Kicker style={{ marginTop: space.xl, textAlign: "center" }}>The Feel Good Challenge</Kicker>
        <DisplayTitle style={styles.title}>
          {mode === "signin" ? "Sign in" : "Start your 55 days"}
        </DisplayTitle>

        {mode === "signup" && (
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          label={mode === "signin" ? "Sign in" : "Sign up"}
          onPress={handleEmail}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <OutlineButton label="Continue with Google" onPress={handleGoogle} disabled={loading} />

        {Platform.OS === "ios" && (
          <OutlineButton
            label="Continue with Apple"
            onPress={handleApple}
            disabled={loading}
            style={{ marginTop: 10 }}
          />
        )}

        <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
          <Body style={styles.switchText}>
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Body>
        </Pressable>

        <Text style={styles.tagline}>WE DO GOOD THINGS HERE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: space.screenX,
    zIndex: 1,
  },
  title: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontSize: 34,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.sans,
    color: colors.foreground,
    fontSize: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: {
    fontFamily: fonts.heading,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.mutedForeground,
  },
  switchText: { textAlign: "center", marginTop: 20 },
  tagline: {
    marginTop: 32,
    textAlign: "center",
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.mutedForeground,
  },
});
