import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  GOAL_OPTIONS,
  ONBOARDING_STEPS,
  WHEEL_DIMENSIONS,
  emptyWheel,
  wheelRowToScores,
  type OnboardingStep,
  type WheelKey,
  type WheelScores,
} from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { uploadLocalImage } from "@/lib/upload-image";
import { Body, DisplayTitle, Kicker, OutlineButton, PrimaryButton, SoftOrbs } from "@/components/ui";
import { colors, fonts, gradients, radius, space } from "@/src/theme";

const STEP_TONES = [
  colors.background,
  "#EDE6DE",
  "#F0E8E4",
  "#EBE8DF",
  "#F2E9E6",
  "#E9E8DF",
  "#EFE7E2",
  "#EBE5DD",
  "#EBE5DD",
];

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [whyJoined, setWhyJoined] = useState("");
  const [whyStatement, setWhyStatement] = useState("");
  const [futureLetter, setFutureLetter] = useState("");
  const [commitmentName, setCommitmentName] = useState("");
  const [wheel, setWheel] = useState<WheelScores>(emptyWheel());

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;
  const progressCount = ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setUid(auth.user.id);

    const [{ data: r }, { data: w }] = await Promise.all([
      supabase.from("onboarding_responses").select("*").eq("user_id", auth.user.id).maybeSingle(),
      supabase.from("transformation_wheel").select("*").eq("user_id", auth.user.id).eq("phase", "day_1").maybeSingle(),
    ]);

    if (r?.completed_at) {
      router.replace("/(app)/today");
      return;
    }
    if (r) {
      setGoals(r.goals ?? []);
      setWhyJoined(r.why_joined ?? "");
      setWhyStatement(r.why_statement ?? "");
      setFutureLetter(r.future_letter ?? "");
      setCommitmentName(r.commitment_name ?? "");
    }
    if (w) setWheel(wheelRowToScores(w as Record<string, number>));
  }

  async function saveResponses(patch: Record<string, unknown>) {
    if (!uid) return;
    await supabase.from("onboarding_responses").upsert(
      {
        user_id: uid,
        goals,
        why_joined: whyJoined,
        why_statement: whyStatement,
        future_letter: futureLetter,
        commitment_name: commitmentName,
        ...patch,
      },
      { onConflict: "user_id" },
    );
  }

  async function saveWheel() {
    if (!uid) return;
    await supabase
      .from("transformation_wheel")
      .upsert({ user_id: uid, phase: "day_1", ...wheel }, { onConflict: "user_id,phase" });
  }

  async function uploadVisionImage() {
    if (!uid) return;
    const { count } = await supabase
      .from("vision_board_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid);
    if ((count ?? 0) >= 8) {
      Alert.alert("Limit reached", "You can add up to 8 vision board images.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Photo library access is required for your vision board.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const path = `${uid}/${Date.now()}.jpg`;
    try {
      await uploadLocalImage({
        bucket: "vision-board",
        path,
        uri: result.assets[0].uri,
        contentType: "image/jpeg",
      });
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Something went wrong");
      return;
    }
    await supabase.from("vision_board_items").insert({ user_id: uid, storage_path: path, sort_order: Date.now() });
    Alert.alert("Saved", "Vision board image added.");
  }

  async function complete() {
    if (!uid) return;
    const now = new Date().toISOString();
    await Promise.all([
      saveResponses({ completed_at: now, commitment_signed_at: now }),
      supabase.from("profiles").update({ onboarding_completed_at: now }).eq("id", uid),
    ]);
    router.replace("/(app)/today");
  }

  function next() {
    if (step === "wheel") void saveWheel();
    if (step === "letter") void saveResponses({});
    if (step === "done") {
      void complete();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <View style={[styles.root, { backgroundColor: STEP_TONES[stepIndex] ?? colors.background }]}>
      <SoftOrbs />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Kicker>The Feel Good Challenge · Onboarding</Kicker>
        <View style={styles.progressRow}>
          {Array.from({ length: progressCount }).map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i <= Math.min(stepIndex, progressCount - 1) ? (
                <LinearGradient
                  colors={[colors.destructive, colors.accent, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              ) : null}
            </View>
          ))}
        </View>

        <Kicker style={{ marginTop: space.xl }}>
          Step {Math.min(stepIndex + 1, progressCount)} / {progressCount}
        </Kicker>
        <DisplayTitle style={styles.title}>{stepTitle(step)}</DisplayTitle>
        <Body style={{ marginBottom: space.lg }}>{stepSubtitle(step)}</Body>

        {step === "welcome" && null}

        {step === "why" && (
          <Field
            label="Why are you here?"
            value={whyJoined}
            onChangeText={setWhyJoined}
            onBlur={() => saveResponses({ why_joined: whyJoined })}
          />
        )}

        {step === "goals" && (
          <View style={styles.goalsWrap}>
            {GOAL_OPTIONS.map((g) => {
              const active = goals.includes(g);
              return (
                <Pressable
                  key={g}
                  onPress={() => {
                    const nextGoals = active ? goals.filter((x) => x !== g) : [...goals, g];
                    setGoals(nextGoals);
                    void saveResponses({ goals: nextGoals });
                  }}
                >
                  {active ? (
                    <LinearGradient
                      colors={[...gradients.goalActive]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.goalChip, styles.goalChipActive]}
                    >
                      <Text style={styles.goalTextActive}>{g}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.goalChip}>
                      <Text style={styles.goalText}>{g}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {step === "commitment" && (
          <Field
            label="Type your name to agree"
            value={commitmentName}
            onChangeText={setCommitmentName}
            onBlur={() => saveResponses({ commitment_name: commitmentName })}
          />
        )}

        {step === "wheel" && (
          <View style={styles.wheelCard}>
            {WHEEL_DIMENSIONS.map((d) => {
              const key = d.key as WheelKey;
              return (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={styles.scaleLabel}>
                    {d.label}: {wheel[key]}/10
                  </Text>
                  <View style={styles.scaleRow}>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const n = i + 1;
                      return (
                        <Pressable
                          key={n}
                          style={[styles.scaleDot, n <= wheel[key] && styles.scaleDotActive]}
                          onPress={() => setWheel({ ...wheel, [key]: n })}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {step === "why-statement" && (
          <Field
            label="Why does this matter?"
            value={whyStatement}
            onChangeText={setWhyStatement}
            multiline
            onBlur={() => saveResponses({ why_statement: whyStatement })}
          />
        )}

        {step === "vision" && (
          <PrimaryButton label="Add vision board image" onPress={uploadVisionImage} />
        )}

        {step === "letter" && (
          <Field
            label="Letter to Future You"
            value={futureLetter}
            onChangeText={setFutureLetter}
            multiline
            onBlur={() => saveResponses({ future_letter: futureLetter })}
          />
        )}

        {step === "done" && null}

        <View style={styles.navRow}>
          {stepIndex > 0 && (
            <OutlineButton label="Back" onPress={back} style={{ flex: 0, paddingHorizontal: 24 }} />
          )}
          <PrimaryButton
            label={step === "done" ? "Begin" : "Continue"}
            onPress={next}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function stepTitle(step: OnboardingStep) {
  const map: Record<OnboardingStep, string> = {
    welcome: "Welcome",
    why: "Why are you here?",
    goals: "Choose your goals",
    commitment: "Your commitment",
    wheel: "Transformation Wheel",
    "why-statement": "Your why",
    vision: "Vision board",
    letter: "Future You letter",
    done: "You're in",
  };
  return map[step];
}

function stepSubtitle(step: OnboardingStep) {
  const map: Record<OnboardingStep, string> = {
    welcome: "This is your commitment. 55 days. One transformation.",
    why: "Be honest. This anchors your journey.",
    goals: "Pick what matters most right now.",
    commitment: "Show up for yourself.",
    wheel: "Rate where you are today, from 1 to 10.",
    "why-statement": "Write the reason you’ll return on hard days.",
    vision: "Collect images of the life you’re building.",
    letter: "Write to the person you’ll become.",
    done: "Everything is saved. Ready to begin Day 1?",
  };
  return map[step];
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.scaleLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 120, textAlignVertical: "top" }]}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: space.screenX, paddingTop: 56, paddingBottom: 48, flexGrow: 1 },
  progressRow: { flexDirection: "row", gap: 4, marginTop: 12 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: { flex: 1, height: "100%" },
  title: { fontSize: 34, marginTop: 8, marginBottom: 8 },
  goalsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalChipActive: { borderColor: "transparent" },
  goalText: { fontFamily: fonts.sans, color: colors.foreground },
  goalTextActive: { fontFamily: fonts.sansSemi, color: colors.foreground },
  wheelCard: {
    backgroundColor: colors.card,
    borderRadius: radius["3xl"],
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scaleLabel: { fontFamily: fonts.sansSemi, marginBottom: 6, color: colors.foreground },
  scaleRow: { flexDirection: "row", gap: 4 },
  scaleDot: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scaleDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 14,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.sans,
    color: colors.foreground,
  },
  navRow: { flexDirection: "row", gap: 12, marginTop: 28 },
});
