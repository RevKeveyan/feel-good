import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Check, Lock, Sparkles, Trash2 } from "@/components/ui/icons";
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
import { alertMediaPermissionNeeded } from "@/lib/media-permissions";
import { cacheBustUrl, extensionForContentType, formatUploadError, guessImageContentType, uploadLocalImage } from "@/lib/upload-image";
import {
  GradientArea,
  PromptField,
  RadarChart,
  StepToneBackground,
  VisionAddTile,
  WheelScale,
} from "@/components/onboarding";
import { Body, DisplayTitle, IconLabel, Kicker, Label, OutlineButton, PrimaryButton } from "@/components/ui";
import { colors, fonts, gradients, radius, space, visionRingColors } from "@/src/theme";

type VisionItem = { id: string; storage_path: string; url: string };

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [whyJoined, setWhyJoined] = useState("");
  const [whyChange, setWhyChange] = useState("");
  const [wantToFeel, setWantToFeel] = useState("");
  const [successLooksLike, setSuccessLooksLike] = useState("");
  const [whyStatement, setWhyStatement] = useState("");
  const [futureLetter, setFutureLetter] = useState("");
  const [commitmentName, setCommitmentName] = useState("");
  const [commitmentSignedAt, setCommitmentSignedAt] = useState<string | null>(null);
  const [wheel, setWheel] = useState<WheelScores>(emptyWheel());
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [visionUploading, setVisionUploading] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;
  const progressCount = ONBOARDING_STEPS.length - 1;
  const visibleIndex = Math.min(stepIndex, progressCount - 1);

  const otherEntry = goals.find((s) => s === "Other" || s.startsWith("Other:")) ?? null;
  const hasOther = otherEntry !== null;
  const otherText =
    otherEntry && otherEntry.startsWith("Other:") ? otherEntry.slice("Other:".length).trim() : "";

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setUid(auth.user.id);

    const [{ data: r }, { data: w }] = await Promise.all([
      supabase.from("onboarding_responses").select("*").eq("user_id", auth.user.id).maybeSingle(),
      supabase
        .from("transformation_wheel")
        .select("*")
        .eq("user_id", auth.user.id)
        .eq("phase", "day_1")
        .maybeSingle(),
    ]);

    if (r?.completed_at) {
      router.replace("/(app)/today");
      return;
    }
    if (r) {
      setGoals(r.goals ?? []);
      setWhyJoined(r.why_joined ?? "");
      setWhyChange(r.why_change ?? "");
      setWantToFeel(r.want_to_feel ?? "");
      setSuccessLooksLike(r.success_looks_like ?? "");
      setWhyStatement(r.why_statement ?? "");
      setFutureLetter(r.future_letter ?? "");
      setCommitmentName(r.commitment_name ?? "");
      setCommitmentSignedAt(r.commitment_signed_at ?? null);
    }
    if (w) setWheel(wheelRowToScores(w as Record<string, number>));
    await loadVision(auth.user.id);
  }

  async function loadVision(userId: string) {
    const { data } = await supabase
      .from("vision_board_items")
      .select("id, storage_path")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    if (!data?.length) {
      setVisionItems([]);
      return;
    }
    const items: VisionItem[] = [];
    for (const row of data) {
      const { data: signed } = await supabase.storage
        .from("vision-board")
        .createSignedUrl(row.storage_path, 3600);
      if (signed?.signedUrl) {
        items.push({
          id: row.id,
          storage_path: row.storage_path,
          url: cacheBustUrl(signed.signedUrl) ?? signed.signedUrl,
        });
      }
    }
    setVisionItems(items);
  }

  async function saveResponses(patch: Record<string, unknown>) {
    if (!uid) return;
    await supabase.from("onboarding_responses").upsert(
      {
        user_id: uid,
        goals,
        why_joined: whyJoined,
        why_change: whyChange,
        want_to_feel: wantToFeel,
        success_looks_like: successLooksLike,
        why_statement: whyStatement,
        future_letter: futureLetter,
        commitment_name: commitmentName,
        commitment_signed_at: commitmentSignedAt,
        ...patch,
      },
      { onConflict: "user_id" },
    );
  }

  async function saveWheel(next: WheelScores) {
    if (!uid) return;
    await supabase
      .from("transformation_wheel")
      .upsert({ user_id: uid, phase: "day_1", ...next }, { onConflict: "user_id,phase" });
  }

  function isGoalOn(g: string) {
    return g === "Other" ? hasOther : goals.includes(g);
  }

  function toggleGoal(g: string) {
    let nextGoals: string[];
    if (g === "Other") {
      nextGoals = hasOther
        ? goals.filter((s) => s !== "Other" && !s.startsWith("Other:"))
        : [...goals, "Other"];
    } else {
      nextGoals = goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g];
    }
    setGoals(nextGoals);
    void saveResponses({ goals: nextGoals });
  }

  function setOtherText(text: string) {
    const without = goals.filter((s) => s !== "Other" && !s.startsWith("Other:"));
    const nextGoals = [...without, text.length > 0 ? `Other: ${text}` : "Other"];
    setGoals(nextGoals);
    void saveResponses({ goals: nextGoals });
  }

  async function pickVisionLibraryAsset() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alertMediaPermissionNeeded("Photo library access is required for your vision board.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    const mimeType =
      asset.mimeType?.trim() ||
      guessImageContentType(asset.fileName ?? asset.uri);
    return {
      uri: asset.uri,
      mimeType,
      fileName: asset.fileName ?? null,
    };
  }

  function visionStoragePath(userId: string, mimeType: string, fileName: string | null) {
    const fromName = fileName?.split(".").pop()?.toLowerCase();
    const ext =
      fromName && /^[a-z0-9]+$/.test(fromName)
        ? fromName
        : extensionForContentType(mimeType);
    return `${userId}/${Date.now()}.${ext}`;
  }

  async function uploadVisionImage() {
    if (!uid || visionUploading) return;
    if (visionItems.length >= 8) {
      Alert.alert("Limit reached", "You can add up to 8 vision board images.");
      return;
    }
    const asset = await pickVisionLibraryAsset();
    if (!asset) return;
    const path = visionStoragePath(uid, asset.mimeType, asset.fileName);
    setVisionUploading(true);
    try {
      await uploadLocalImage({
        bucket: "vision-board",
        path,
        uri: asset.uri,
        contentType: asset.mimeType,
      });
      const { error } = await supabase
        .from("vision_board_items")
        .insert({ user_id: uid, storage_path: path, sort_order: Date.now() });
      if (error) {
        await supabase.storage.from("vision-board").remove([path]);
        throw new Error(error.message || "Could not save vision board item");
      }
      await loadVision(uid);
    } catch (e) {
      Alert.alert("Upload failed", formatUploadError(e));
    } finally {
      setVisionUploading(false);
    }
  }

  async function replaceVisionItem(item: VisionItem) {
    if (!uid || visionUploading) return;
    const asset = await pickVisionLibraryAsset();
    if (!asset) return;
    const path = visionStoragePath(uid, asset.mimeType, asset.fileName);
    setVisionUploading(true);
    try {
      await uploadLocalImage({
        bucket: "vision-board",
        path,
        uri: asset.uri,
        contentType: asset.mimeType,
      });
      const { error } = await supabase
        .from("vision_board_items")
        .update({ storage_path: path })
        .eq("id", item.id)
        .eq("user_id", uid);
      if (error) {
        await supabase.storage.from("vision-board").remove([path]);
        throw new Error(error.message || "Could not update vision board item");
      }
      if (item.storage_path !== path) {
        await supabase.storage.from("vision-board").remove([item.storage_path]);
      }
      await loadVision(uid);
    } catch (e) {
      Alert.alert("Replace failed", formatUploadError(e));
    } finally {
      setVisionUploading(false);
    }
  }

  async function removeVisionItem(item: VisionItem) {
    if (!uid) return;
    await supabase.storage.from("vision-board").remove([item.storage_path]);
    await supabase.from("vision_board_items").delete().eq("id", item.id);
    setVisionItems((prev) => prev.filter((v) => v.id !== item.id));
  }

  async function signCommitment() {
    const name = commitmentName.trim();
    if (!name) return;
    const signedAt = new Date().toISOString();
    setCommitmentName(name);
    setCommitmentSignedAt(signedAt);
    await saveResponses({ commitment_name: name, commitment_signed_at: signedAt });
  }

  async function complete() {
    if (!uid) return;
    const now = new Date().toISOString();
    await Promise.all([
      saveResponses({
        completed_at: now,
        commitment_signed_at: commitmentSignedAt ?? now,
      }),
      supabase.from("profiles").update({ onboarding_completed_at: now }).eq("id", uid),
    ]);
    router.replace("/(app)/today");
  }

  function canContinue(): boolean {
    if (step === "goals") return goals.length > 0;
    if (step === "commitment") return !!commitmentSignedAt && !!commitmentName.trim();
    if (step === "why-statement") return whyStatement.trim().length >= 10;
    if (step === "letter") return futureLetter.trim().length >= 20;
    return true;
  }

  function next() {
    if (!canContinue()) {
      if (step === "goals") Alert.alert("Pick at least one goal");
      else if (step === "commitment") Alert.alert("Sign your commitment first");
      else if (step === "why-statement") Alert.alert("Write at least 10 characters");
      else if (step === "letter") Alert.alert("Write at least 20 characters");
      return;
    }
    if (step === "why") {
      void saveResponses({
        why_joined: whyJoined,
        why_change: whyChange,
        want_to_feel: wantToFeel,
        success_looks_like: successLooksLike,
      });
    }
    if (step === "wheel") void saveWheel(wheel);
    if (step === "letter") void saveResponses({ future_letter: futureLetter });
    if (step === "done") {
      void complete();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function updateWheel(key: WheelKey, n: number) {
    const nextWheel = { ...wheel, [key]: n };
    setWheel(nextWheel);
    void saveWheel(nextWheel);
  }

  return (
    <View style={styles.root}>
      <StepToneBackground step={step} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Kicker>The Feel Good Challenge · Onboarding</Kicker>
        <View style={styles.progressRow}>
          {Array.from({ length: progressCount }).map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i <= visibleIndex ? (
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

        <Kicker style={{ marginTop: space.xl }}>{stepEyebrow(step)}</Kicker>
        <DisplayTitle style={styles.title}>{stepTitle(step)}</DisplayTitle>
        {stepSubtitle(step) ? (
          <Body style={{ marginBottom: space.lg }}>{stepSubtitle(step)}</Body>
        ) : null}

        {step === "welcome" && (
          <GradientArea colorsStops={gradients.welcomeFoundation}>
            <Body style={{ color: colors.foreground + "CC" }}>
              Before Day 1, we&apos;ll spend a few minutes on the emotional foundation, why you&apos;re
              here, what you want to feel, and what success actually looks like for you. This
              is the part most challenges skip. It&apos;s what makes yours stick.
            </Body>
          </GradientArea>
        )}

        {step === "why" && (
          <>
            <PromptField
              label="What's happening in your life that brought you here today?"
              value={whyJoined}
              onChangeText={setWhyJoined}
              multiline
              onBlur={() => saveResponses({ why_joined: whyJoined })}
            />
            <PromptField
              label="What part of your life would you most love to improve over the next 55 days?"
              value={whyChange}
              onChangeText={setWhyChange}
              multiline
              onBlur={() => saveResponses({ why_change: whyChange })}
            />
            <PromptField
              label="What do you hope this journey helps you rediscover about yourself?"
              value={wantToFeel}
              onChangeText={setWantToFeel}
              multiline
              onBlur={() => saveResponses({ want_to_feel: wantToFeel })}
            />
            <PromptField
              label="If this challenge exceeded your expectations, what would that look and feel like?"
              value={successLooksLike}
              onChangeText={setSuccessLooksLike}
              multiline
              onBlur={() => saveResponses({ success_looks_like: successLooksLike })}
            />
          </>
        )}

        {step === "goals" && (
          <View>
            <View style={styles.goalsWrap}>
              {GOAL_OPTIONS.map((g) => {
                const active = isGoalOn(g);
                return (
                  <Pressable
                    key={g}
                    onPress={() => toggleGoal(g)}
                    style={styles.goalPressable}
                  >
                    {active ? (
                      <LinearGradient
                        colors={[...gradients.goalActive]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.goalChip, styles.goalChipActive]}
                      >
                        <Label style={styles.goalTextActive} numberOfLines={3}>
                          {g}
                        </Label>
                        <View style={styles.goalCheckOn}>
                          <Check size={10} color={colors.foreground} strokeWidth={3} />
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.goalChip}>
                        <Label style={styles.goalText} numberOfLines={3}>
                          {g}
                        </Label>
                        <View style={styles.goalCheckOff} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {hasOther && (
              <PromptField
                label='Tell us what "Other" means to you'
                value={otherText}
                onChangeText={setOtherText}
                placeholder="In a few words…"
              />
            )}
          </View>
        )}

        {step === "commitment" && (
          <GradientArea
            colorsStops={gradients.commitment}
            padded={false}
            style={{ marginBottom: 0 }}
          >
            <View style={styles.commitmentInner}>
              <DisplayTitle size="sm" style={styles.pledge}>
                &ldquo;I commit to showing up for myself for the next 55 days.&rdquo;
              </DisplayTitle>
              <Kicker style={styles.commitmentKicker}>Type your name to sign</Kicker>
              <TextInput
                style={styles.commitmentInput}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                value={commitmentName}
                onChangeText={setCommitmentName}
              />
              <PrimaryButton
                label={commitmentSignedAt ? `Signed, ${commitmentName}` : "I agree"}
                onPress={signCommitment}
                disabled={!commitmentName.trim() || !!commitmentSignedAt}
                style={styles.commitmentAgree}
              />
              {commitmentSignedAt ? (
                <Body size="sm" style={{ marginTop: 12 }}>
                  Signed {new Date(commitmentSignedAt).toLocaleString()}
                </Body>
              ) : null}
            </View>
          </GradientArea>
        )}

        {step === "wheel" && (
          <>
            <GradientArea colorsStops={gradients.wheelCard} padded={false} style={{ padding: 16 }}>
              <RadarChart axes={[...WHEEL_DIMENSIONS]} values={wheel} />
            </GradientArea>
            <View style={styles.wheelScales}>
              {WHEEL_DIMENSIONS.map((d) => {
                const key = d.key as WheelKey;
                return (
                  <WheelScale
                    key={key}
                    label={d.label}
                    value={wheel[key]}
                    onChange={(n) => updateWheel(key, n)}
                  />
                );
              })}
            </View>
          </>
        )}

        {step === "why-statement" && (
          <GradientArea colorsStops={gradients.whyStatement} style={{ marginBottom: 0 }}>
            <TextInput
              style={styles.whyStatementInput}
              placeholder="This matters to me because…"
              placeholderTextColor={colors.mutedForeground + "80"}
              value={whyStatement}
              onChangeText={setWhyStatement}
              onBlur={() => saveResponses({ why_statement: whyStatement })}
              multiline
              textAlignVertical="top"
            />
          </GradientArea>
        )}

        {step === "vision" && (
          <View>
            <View style={styles.visionGrid}>
              {visionItems.map((item, i) => (
                <View
                  key={item.id}
                  style={[
                    styles.visionCell,
                    { borderColor: visionRingColors[i % visionRingColors.length] },
                  ]}
                >
                  <Pressable
                    style={StyleSheet.absoluteFill}
                    disabled={visionUploading}
                    onPress={() => void replaceVisionItem(item)}
                  >
                    <Image source={{ uri: item.url }} style={styles.visionImage} />
                  </Pressable>
                  <Pressable style={styles.visionRemove} onPress={() => void removeVisionItem(item)}>
                    <Trash2 size={16} color="#fff" strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
              {visionItems.length < 8 && (
                <VisionAddTile
                  onPress={() => void uploadVisionImage()}
                  uploading={visionUploading}
                />
              )}
            </View>
            <IconLabel
              style={{ marginTop: 4 }}
              gap={8}
              icon={<Lock size={14} color={colors.mutedForeground} strokeWidth={2} />}
            >
              <Body>Only you can see these. Tap a photo to replace it.</Body>
            </IconLabel>
          </View>
        )}

        {step === "letter" && (
          <>
            <View style={styles.letterCard}>
              <TextInput
                style={styles.letterInput}
                placeholder="Dear future me,"
                placeholderTextColor={colors.mutedForeground + "80"}
                value={futureLetter}
                onChangeText={setFutureLetter}
                onBlur={() => saveResponses({ future_letter: futureLetter })}
                multiline
                textAlignVertical="top"
              />
            </View>
            <IconLabel
              style={{ marginTop: 4 }}
              gap={8}
              icon={<Lock size={14} color={colors.mutedForeground} strokeWidth={2} />}
            >
              <Body>Sealed until Day 55.</Body>
            </IconLabel>
          </>
        )}

        {step === "done" && (
          <GradientArea colorsStops={gradients.doneHero}>
            <Sparkles size={24} color={colors.foreground} strokeWidth={2} style={{ marginBottom: 16 }} />
            <DisplayTitle size="sm" style={styles.doneLead}>
              Tomorrow is Day 1. Today, you chose yourself.
            </DisplayTitle>
            <Body style={{ color: colors.foreground + "D9" }}>
              Your goals, your wheel, your why, your vision and your letter are saved. We&apos;ll
              bring them back to you at the moments that matter.
            </Body>
          </GradientArea>
        )}

        <View style={styles.navRow}>
          {stepIndex > 0 && step !== "done" && (
            <OutlineButton
              label="Back"
              onPress={back}
              style={{ flex: 0, paddingHorizontal: 24 }}
              leadingIcon={<ArrowLeft size={16} color={colors.foreground + "B3"} strokeWidth={2} />}
            />
          )}
          <PrimaryButton
            label={stepCta(step)}
            onPress={next}
            style={{ flex: 1 }}
            disabled={!canContinue() && step !== "done"}
            trailingIcon={
              step !== "done" ? (
                <ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2} />
              ) : undefined
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

function stepEyebrow(step: OnboardingStep) {
  const map: Record<OnboardingStep, string> = {
    welcome: "Welcome",
    why: "Step 1 of 7",
    goals: "Step 2 of 7",
    commitment: "Step 3 of 7",
    wheel: "Step 4 of 7",
    "why-statement": "Step 5 of 7",
    vision: "Step 6 of 7",
    letter: "Step 7 of 7",
    done: "You're ready",
  };
  return map[step];
}

function stepTitle(step: OnboardingStep) {
  const map: Record<OnboardingStep, string> = {
    welcome: "This isn't another challenge.",
    why: "Why are you here?",
    goals: "Choose your goals.",
    commitment: "Your commitment.",
    wheel: "Your Transformation Wheel.",
    "why-statement": "Why does this matter?",
    vision: "Your vision board.",
    letter: "A letter to future you.",
    done: "The foundation is set.",
  };
  return map[step];
}

function stepSubtitle(step: OnboardingStep): string | null {
  const map: Record<OnboardingStep, string | null> = {
    welcome:
      "It's your commitment to becoming the healthiest version of yourself. Over the next 55 days, we'll build habits you'll keep for life, one day at a time.",
    why: "Short answers. First instinct is usually the truest.",
    goals: "Pick as many as feel true. We'll come back to these on Day 55.",
    commitment: null,
    wheel: "Rate where you are today across nine areas. You'll rate again on Day 55, this is your before.",
    "why-statement": "Write it once. We'll show it back to you on Day 55.",
    vision:
      "Upload up to 8 images that show what you're moving toward. Family, holiday, a dress, the version of you you're becoming. Private to you.",
    letter:
      "Write to the person you'll be on Day 55. What do you want them to know? What are you promising them? This letter will be sealed until then.",
    done: null,
  };
  return map[step];
}

function stepCta(step: OnboardingStep) {
  if (step === "welcome") return "Begin";
  if (step === "letter") return "Finish";
  if (step === "done") return "Enter the challenge";
  return "Continue";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: space.screenX, paddingTop: 56, paddingBottom: 48, flexGrow: 1 },
  progressRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.foreground + "1A",
    overflow: "hidden",
  },
  progressFill: { flex: 1, height: "100%" },
  title: { fontSize: 34, marginTop: 8, marginBottom: 8 },
  goalsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    marginBottom: 12,
  },
  goalPressable: {
    width: "48.5%",
    height: 88,
  },
  goalChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius["2xl"],
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    height: 88,
  },
  goalChipActive: {
    borderColor: colors.lime + "99",
  },
  goalText: {
    flex: 1,
    flexShrink: 1,
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 18,
  },
  goalTextActive: {
    flex: 1,
    flexShrink: 1,
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 18,
  },
  goalCheckOff: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    flexShrink: 0,
  },
  goalCheckOn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  commitmentInner: {
    padding: 28,
  },
  pledge: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 24,
  },
  commitmentKicker: {
    marginBottom: 8,
  },
  commitmentInput: {
    backgroundColor: colors.background,
    borderRadius: radius["2xl"],
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + "4D",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 18,
    color: colors.foreground,
  },
  commitmentAgree: {
    marginTop: 24,
  },
  wheelScales: { marginTop: 16 },
  whyStatementInput: {
    minHeight: 160,
    backgroundColor: "transparent",
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.foreground,
    padding: 0,
  },
  letterCard: {
    backgroundColor: colors.card,
    borderRadius: radius["3xl"],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ringHairline,
    marginBottom: 4,
  },
  letterInput: {
    minHeight: 200,
    backgroundColor: "transparent",
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 26,
    color: colors.foreground,
    padding: 0,
  },
  doneLead: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 12,
  },
  visionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  visionCell: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: radius["2xl"],
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  visionImage: { width: "100%", height: "100%" },
  visionRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(34,34,34,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  navRow: { flexDirection: "row", gap: 12, marginTop: 28 },
});
