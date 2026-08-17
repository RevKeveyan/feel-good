import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";
import { Redirect, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import {
  APPLE_SIGN_IN_ENABLED,
  GOOGLE_SIGN_IN_ENABLED,
  getLastOAuthRedirectParam,
  getOAuthRedirectTo,
  isEmailNotConfirmedError,
  isPasswordRecoveryPending,
  markPasswordRecoveryPending,
  requestPasswordReset,
  resendSignupConfirmation,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  verifySignupOtp,
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
import { KeyboardAccessoryBar, KeyboardScreen } from "@/components/KeyboardScreen";
import { borders, colors, fonts, radius, space, typeScale } from "@/src/theme";

type AuthMode = "signin" | "signup" | "forgot" | "confirm";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<boolean | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const passwordRef = useRef<TextInputType>(null);
  const confirmCodeRef = useRef<TextInputType>(null);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isPasswordRecoveryPending()) {
          setPasswordRecovery(true);
          setSession(!!data.session);
          return;
        }
        setSession(!!data.session);
      })
      .catch((e) => {
        console.warn("[auth] getSession failed", e instanceof Error ? e.message : e);
        setSession(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY" || isPasswordRecoveryPending()) {
        markPasswordRecoveryPending();
        setPasswordRecovery(true);
        setSession(!!next);
        return;
      }
      setSession(!!next);
      if (!next) setPasswordRecovery(false);
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

  if (passwordRecovery || isPasswordRecoveryPending()) {
    return (
      <Redirect
        href={{
          pathname: "/auth/reset",
          params: email.trim() ? { email: email.trim() } : undefined,
        }}
      />
    );
  }
  if (session && mode !== "forgot" && mode !== "confirm") {
    return <Redirect href="/(app)/overview" />;
  }

  async function handleEmail() {
    setLoading(true);
    try {
      if (mode === "forgot") {
        if (!email.trim()) {
          Alert.alert("Email required", "Enter the email for your account.");
          return;
        }
        await requestPasswordReset(email.trim());
        router.push({
          pathname: "/auth/reset",
          params: { email: email.trim() },
        });
        return;
      }
      if (mode === "signup") {
        if (!email.trim() || !password) {
          Alert.alert("Missing details", "Enter your email and password.");
          return;
        }
        const { hasSession } = await signUpWithEmail(email.trim(), password, name.trim());
        if (hasSession) {
          trackEvent("auth_sign_in", { method: "email_signup" });
          router.replace("/(app)/overview");
          return;
        }
        setConfirmCode("");
        setMode("confirm");
        Alert.alert(
          "Check your inbox",
          "We sent a one-time code. Enter it below to confirm your email, or try signing in if you already verified.",
        );
        return;
      }
      await signInWithEmail(email.trim(), password);
      trackEvent("auth_sign_in", { method: "email" });
      router.replace("/(app)/overview");
    } catch (e) {
      if (mode === "signin" && isEmailNotConfirmedError(e)) {
        setConfirmCode("");
        setMode("confirm");
        Alert.alert(
          "Confirm your email",
          "Your project still requires email confirmation for sign-in. Enter the code from your inbox, or resend a new one.",
        );
        return;
      }
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode() {
    const trimmedEmail = email.trim();
    const trimmedCode = confirmCode.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter the email for your account.");
      return;
    }
    if (!trimmedCode) {
      Alert.alert("Code required", "Enter the one-time code from your email.");
      return;
    }
    setLoading(true);
    try {
      await verifySignupOtp(trimmedEmail, trimmedCode);
      trackEvent("auth_sign_in", { method: "email_confirm" });
      router.replace("/(app)/overview");
    } catch (e) {
      Alert.alert("Invalid code", e instanceof Error ? e.message : "Could not verify code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirm() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter the email for your account.");
      return;
    }
    setLoading(true);
    try {
      await resendSignupConfirmation(trimmedEmail);
      Alert.alert("Code sent", "Check your inbox for a new one-time code.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      trackEvent("auth_sign_in", { method: "google" });
      router.replace("/(app)/overview");
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

  async function handleApple() {
    setLoading(true);
    try {
      await signInWithApple();
      trackEvent("auth_sign_in", { method: "apple" });
      router.replace("/(app)/overview");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Apple sign in failed");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "forgot"
      ? "Reset password"
      : mode === "confirm"
        ? "Enter confirm code"
        : mode === "signin"
          ? "Sign in"
          : "Start your 55 days";
  const kicker =
    mode === "forgot"
      ? "We'll email you a one-time code"
      : mode === "confirm"
        ? "Check your inbox"
        : mode === "signin"
          ? "Welcome back"
          : "Join the challenge";

  const primaryLabel =
    mode === "confirm"
      ? "Confirm email"
      : mode === "forgot"
        ? "Send reset code"
        : mode === "signin"
          ? "Sign in"
          : "Create account";
  const primaryAction = mode === "confirm" ? handleConfirmCode : handleEmail;

  return (
    <KeyboardScreen
      style={styles.container}
      contentContainerStyle={styles.scrollInner}
      background={<SoftOrbs />}
      accessory={
        <KeyboardAccessoryBar
          primaryLabel={primaryLabel}
          onPrimaryPress={primaryAction}
          primaryDisabled={loading}
        />
      }
    >
      <View style={styles.content}>
        <BrandWordmark size="md" />
        <View style={styles.headingBlock}>
          <Kicker style={styles.kicker}>{kicker}</Kicker>
          <DisplayTitle size="md" style={styles.title}>
            {title}
          </DisplayTitle>
        </View>

        {GOOGLE_SIGN_IN_ENABLED && mode !== "forgot" && mode !== "confirm" && (
          <>
            <OutlineButton label="Continue with Google" onPress={handleGoogle} disabled={loading} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Kicker style={styles.or}>or</Kicker>
              <View style={styles.line} />
            </View>
          </>
        )}

        {APPLE_SIGN_IN_ENABLED &&
          Platform.OS === "ios" &&
          mode !== "forgot" &&
          mode !== "confirm" && (
            <>
              <OutlineButton label="Continue with Apple" onPress={handleApple} disabled={loading} />

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
            returnKeyType="next"
            blurOnSubmit={false}
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
          editable={mode !== "confirm" || !email}
          returnKeyType={mode === "forgot" ? "done" : mode === "confirm" ? "next" : "next"}
          blurOnSubmit={mode === "forgot"}
          onSubmitEditing={() => {
            if (mode === "forgot") {
              void handleEmail();
              return;
            }
            if (mode === "confirm") {
              confirmCodeRef.current?.focus();
              return;
            }
            passwordRef.current?.focus();
          }}
        />
        {mode === "confirm" && (
          <TextInput
            ref={confirmCodeRef}
            style={styles.input}
            placeholder="One-time code"
            placeholderTextColor={colors.mutedForeground}
            value={confirmCode}
            onChangeText={setConfirmCode}
            autoCapitalize="none"
            keyboardType="number-pad"
          />
        )}
        {mode !== "forgot" && mode !== "confirm" && (
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleEmail}
          />
        )}

        {mode === "signin" && (
          <Pressable onPress={() => setMode("forgot")} style={styles.forgotWrap}>
            <Body size="sm" style={styles.forgotLink}>
              Forgot password?
            </Body>
          </Pressable>
        )}

        {mode === "confirm" ? (
          <>
            <PrimaryButton
              label="Confirm email"
              onPress={handleConfirmCode}
              loading={loading}
              style={{ marginTop: 8 }}
            />
            <Pressable onPress={handleResendConfirm} disabled={loading}>
              <Body size="sm" style={styles.switchText}>
                Didn’t get it? <Label style={styles.switchLink}>Resend code</Label>
              </Body>
            </Pressable>
          </>
        ) : (
          <PrimaryButton
            label={primaryLabel}
            onPress={handleEmail}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        )}

        <Pressable
          onPress={() => {
            if (mode === "confirm") {
              setMode("signin");
              setConfirmCode("");
              return;
            }
            setMode(mode === "signin" ? "signup" : mode === "signup" ? "signin" : "signin");
          }}
        >
          <Body size="sm" style={styles.switchText}>
            {mode === "forgot"
              ? "Remembered it? "
              : mode === "confirm"
                ? "Already confirmed? "
                : mode === "signin"
                  ? "New here? "
                  : "Already have an account? "}
            <Label style={styles.switchLink}>
              {mode === "forgot" || mode === "confirm" || mode === "signup"
                ? "Sign in"
                : "Create an account"}
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
    </KeyboardScreen>
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
    backgroundColor: colors.background,
  },
  scrollInner: {
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: space.screenX,
    zIndex: 1,
  },
  headingBlock: { marginTop: space["2xl"], marginBottom: space["2xl"] },
  kicker: {
    textAlign: "center",
    letterSpacing: 2.5,
  },
  title: {
    textAlign: "center",
    marginTop: space.md,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: space.inputX,
    paddingVertical: space.inputY,
    marginBottom: space.md,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    fontFamily: fonts.sans,
    color: colors.foreground,
    fontSize: typeScale.input.fontSize,
    lineHeight: typeScale.input.lineHeight,
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: space.xs, marginTop: -4 },
  forgotLink: {
    color: colors.mutedForeground,
    textDecorationLine: "underline",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginVertical: space.p6,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { letterSpacing: typeScale.kicker.letterSpacing },
  switchText: { textAlign: "center", marginTop: space.p6 },
  switchLink: {
    textDecorationLine: "underline",
    fontSize: typeScale.bodySm.fontSize,
    lineHeight: typeScale.bodySm.lineHeight,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xl,
  },
  legalLink: { letterSpacing: typeScale.kicker.letterSpacing },
  legalSep: { color: colors.mutedForeground },
});
