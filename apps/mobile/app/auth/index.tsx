import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import {
  getLastOAuthRedirectParam,
  getOAuthRedirectTo,
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import {
  BrandWordmark,
  Body,
  DisplayTitle,
  Kicker,
  Label,
  OutlineButton,
  PrimaryButton,
  SoftOrbs,
} from "@/components/ui";
import { colors, fonts, radius, space } from "@/src/theme";

type AuthMode = "signin" | "signup" | "forgot";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<boolean | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setSession(true);
        return;
      }
      setSession(!!next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  if (passwordRecovery) return <Redirect href="/auth/reset" />;
  if (session && mode !== "forgot") return <Redirect href="/(app)/today" />;

  async function handleEmail() {
    setLoading(true);
    try {
      if (mode === "forgot") {
        if (!email.trim()) {
          Alert.alert("Email required", "Enter the email for your account.");
          return;
        }
        await requestPasswordReset(email.trim());
        Alert.alert(
          "Check your inbox",
          "If an account exists for that email, we sent a one-time code. Enter it in the next screen.",
          [
            {
              text: "Enter code",
              onPress: () =>
                router.push({
                  pathname: "/auth/reset",
                  params: { email: email.trim() },
                }),
            },
          ],
        );
        return;
      }
      if (mode === "signup") {
        await signUpWithEmail(email.trim(), password, name.trim());
        Alert.alert("Welcome, check your inbox to confirm your email.");
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
      const message = e instanceof Error ? e.message : "Google sign in failed";
      const redirectTo = getOAuthRedirectTo();
      const redirectParam = getLastOAuthRedirectParam();
      const needsConfigHint =
        message.toLowerCase().includes("path is invalid") ||
        message.toLowerCase().includes("redirect") ||
        message.toLowerCase().includes("site url") ||
        message.toLowerCase().includes("cancelled");
      if (needsConfigHint) {
        Alert.alert(
          "Google OAuth redirect",
          `${message}\n\nSet Site URL to feelgood://auth/callback\nRemove bare https://….supabase.co from Redirect URLs\n\nApp redirectTo:\n${redirectTo}\n\nOAuth redirect_to param:\n${redirectParam ?? "(none)"}`,
          [
            { text: "OK" },
            {
              text: "Share URL",
              onPress: () => {
                void Share.share({
                  message: `Site URL: feelgood://auth/callback\nredirectTo: ${redirectTo}\nredirect_to param: ${redirectParam ?? "(none)"}\nreset: ${redirectTo.replace("/auth/callback", "/auth/reset")}`,
                });
              },
            },
          ],
        );
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "forgot" ? "Reset password" : mode === "signin" ? "Sign in" : "Start your 55 days";
  const kicker =
    mode === "forgot"
      ? "We'll email you a one-time code"
      : mode === "signin"
        ? "Welcome back"
        : "Join the challenge";

  return (
    <SafeAreaView style={styles.container}>
      <SoftOrbs />
      <View style={styles.content}>
        <BrandWordmark size="md" />
        <View style={styles.headingBlock}>
          <Kicker style={{ textAlign: "center" }}>{kicker}</Kicker>
          <DisplayTitle style={styles.title}>{title}</DisplayTitle>
        </View>

        {mode !== "forgot" && (
          <>
            <OutlineButton label="Continue with Google" onPress={handleGoogle} disabled={loading} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Kicker style={styles.or}>or</Kicker>
              <View style={styles.line} />
            </View>
          </>
        )}

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
        {mode !== "forgot" && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        )}

        {mode === "signin" && (
          <Pressable onPress={() => setMode("forgot")} style={styles.forgotWrap}>
            <Body size="sm" style={styles.forgotLink}>
              Forgot password?
            </Body>
          </Pressable>
        )}

        <PrimaryButton
          label={
            mode === "forgot" ? "Send reset code" : mode === "signin" ? "Sign in" : "Create account"
          }
          onPress={handleEmail}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <Pressable
          onPress={() =>
            setMode(mode === "signin" ? "signup" : mode === "signup" ? "signin" : "signin")
          }
        >
          <Body style={styles.switchText}>
            {mode === "forgot"
              ? "Remembered it? "
              : mode === "signin"
                ? "New here? "
                : "Already have an account? "}
            <Label style={styles.switchLink}>
              {mode === "forgot" ? "Sign in" : mode === "signin" ? "Create an account" : "Sign in"}
            </Label>
          </Body>
        </Pressable>

        <View style={styles.legalRow}>
          <Pressable onPress={() => router.push("/privacy")} hitSlop={8}>
            <Kicker style={styles.legalLink}>Privacy Policy</Kicker>
          </Pressable>
          <Body size="sm" style={styles.legalSep}>
            ·
          </Body>
          <Pressable onPress={() => router.push("/terms")} hitSlop={8}>
            <Kicker style={styles.legalLink}>Terms of Service</Kicker>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
  headingBlock: { marginTop: space.xl, marginBottom: space.xl },
  title: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 34,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ringHairline,
    fontFamily: fonts.sans,
    color: colors.foreground,
    fontSize: 14,
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 4, marginTop: -4 },
  forgotLink: { color: colors.mutedForeground, textDecorationLine: "underline" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { letterSpacing: 1.6 },
  switchText: { textAlign: "center", marginTop: 20 },
  switchLink: { textDecorationLine: "underline" },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  legalLink: { letterSpacing: 1.5 },
  legalSep: { color: colors.mutedForeground },
});
