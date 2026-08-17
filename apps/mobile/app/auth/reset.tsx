import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  isPasswordRecoveryPending,
  requestPasswordReset,
  signOut,
  updatePassword,
  verifyRecoveryOtp,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  BrandWordmark,
  Body,
  DisplayTitle,
  Kicker,
  Label,
  PrimaryButton,
  SoftOrbs,
} from "@/components/ui";
import { KeyboardScreen } from "@/components/KeyboardScreen";
import { borders, colors, fonts, radius, space, typeScale } from "@/src/theme";

const MIN_PASSWORD = 6;

type Step = "code" | "password";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const paramEmail = typeof params.email === "string" ? params.email : "";

  const [step, setStep] = useState<Step>(() =>
    isPasswordRecoveryPending() ? "password" : "code",
  );
  const [email, setEmail] = useState(paramEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<TextInputType>(null);
  const confirmRef = useRef<TextInputType>(null);

  useEffect(() => {
    if (paramEmail) setEmail(paramEmail);
  }, [paramEmail]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isPasswordRecoveryPending()) {
        if (!cancelled) setStep("password");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session && isPasswordRecoveryPending()) {
        setStep("password");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVerifyCode() {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
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
      await verifyRecoveryOtp(trimmedEmail, trimmedCode);
      setStep("password");
    } catch (e) {
      Alert.alert("Invalid code", e instanceof Error ? e.message : "Could not verify code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter the email for your account.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(trimmedEmail);
      Alert.alert("Code sent", "Check your inbox for a new one-time code.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPassword() {
    if (password.length < MIN_PASSWORD) {
      Alert.alert("Password too short", `Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match", "Re-enter the same password in both fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStep("code");
        Alert.alert(
          "Session expired",
          "Enter a new one-time code from your email, then set your password.",
        );
        return;
      }
      await updatePassword(password);
      Alert.alert("Password updated", "You're signed in with your new password.");
      router.replace("/(app)/overview");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToSignIn() {
    setLoading(true);
    try {
      await signOut();
    } catch {
      /* still leave reset flow */
    } finally {
      setLoading(false);
      router.replace("/auth");
    }
  }

  return (
    <KeyboardScreen
      style={styles.container}
      contentContainerStyle={styles.scrollInner}
      background={<SoftOrbs />}
    >
      <View style={styles.content}>
        <BrandWordmark size="md" />
        <View style={styles.headingBlock}>
          <Kicker style={styles.kicker}>
            {step === "code" ? "Check your email" : "Almost there"}
          </Kicker>
          <DisplayTitle size="md" style={styles.title}>
            {step === "code" ? "Enter reset code" : "Set new password"}
          </DisplayTitle>
        </View>

        {step === "code" ? (
          <>
            <Body size="sm" style={styles.message}>
              Enter the one-time code we sent to your email. Links are not required.
            </Body>
            <TextInput
              style={[styles.input, paramEmail ? styles.inputReadonly : null]}
              placeholder="Email"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!paramEmail}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => codeRef.current?.focus()}
            />
            <TextInput
              ref={codeRef}
              style={styles.input}
              placeholder="One-time code"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            <PrimaryButton
              label="Verify code"
              onPress={handleVerifyCode}
              loading={loading}
              style={{ marginTop: 8 }}
            />
            <Pressable onPress={handleResend} disabled={loading}>
              <Body size="sm" style={styles.switchText}>
                <Label style={styles.switchLink}>Resend code</Label>
              </Body>
            </Pressable>
          </>
        ) : (
          <>
            <Body size="sm" style={styles.message}>
              Choose a new password for your account. You will stay signed in after updating.
            </Body>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <TextInput
              ref={confirmRef}
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={colors.mutedForeground}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmitPassword}
            />
            <PrimaryButton
              label="Update password"
              onPress={handleSubmitPassword}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </>
        )}

        <Pressable onPress={handleBackToSignIn} disabled={loading}>
          <Body size="sm" style={styles.switchText}>
            <Label style={styles.switchLink}>Back to Sign in</Label>
          </Body>
        </Pressable>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
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
  headingBlock: { marginTop: space["2xl"], marginBottom: space.p6 },
  kicker: {
    textAlign: "center",
    letterSpacing: 2.5,
  },
  title: {
    textAlign: "center",
    marginTop: space.md,
  },
  message: {
    textAlign: "center",
    marginBottom: space.p5,
    color: colors.mutedForeground,
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
  inputReadonly: {
    opacity: 0.85,
  },
  switchText: { textAlign: "center", marginTop: space.p6 },
  switchLink: {
    textDecorationLine: "underline",
    fontSize: typeScale.bodySm.fontSize,
    lineHeight: typeScale.bodySm.lineHeight,
  },
});
