import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  requestPasswordReset,
  updatePassword,
  verifyRecoveryOtp,
} from "@/lib/auth";
import {
  BrandWordmark,
  Body,
  DisplayTitle,
  Kicker,
  Label,
  PrimaryButton,
  SoftOrbs,
} from "@/components/ui";
import { colors, fonts, radius, space } from "@/src/theme";

const MIN_PASSWORD = 6;

type Step = "code" | "password";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const paramEmail = typeof params.email === "string" ? params.email : "";

  const [step, setStep] = useState<Step>("code");
  const [email, setEmail] = useState(paramEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paramEmail) setEmail(paramEmail);
  }, [paramEmail]);

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
      await updatePassword(password);
      Alert.alert("Password updated", "You're signed in with your new password.");
      router.replace("/(app)/today");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <SoftOrbs />
      <View style={styles.content}>
        <BrandWordmark size="md" />
        <View style={styles.headingBlock}>
          <Kicker style={{ textAlign: "center" }}>
            {step === "code" ? "Check your email" : "Almost there"}
          </Kicker>
          <DisplayTitle style={styles.title}>
            {step === "code" ? "Enter reset code" : "Set new password"}
          </DisplayTitle>
        </View>

        {step === "code" ? (
          <>
            <Body style={styles.message}>
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
            />
            <TextInput
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
              <Body style={styles.switchText}>
                <Label style={styles.switchLink}>Resend code</Label>
              </Body>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={colors.mutedForeground}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            <PrimaryButton
              label="Update password"
              onPress={handleSubmitPassword}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </>
        )}

        <Pressable onPress={() => router.replace("/auth")}>
          <Body style={styles.switchText}>
            <Label style={styles.switchLink}>Back to Sign in</Label>
          </Body>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: space.screenX,
    zIndex: 1,
  },
  headingBlock: { marginTop: space.xl, marginBottom: space.lg },
  title: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 34,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    color: colors.mutedForeground,
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
  inputReadonly: {
    opacity: 0.85,
  },
  switchText: { textAlign: "center", marginTop: 20 },
  switchLink: { textDecorationLine: "underline" },
});
