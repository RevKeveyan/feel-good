import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Check, Lock, Sparkles } from "@/components/ui/icons";
import { router, useLocalSearchParams } from "expo-router";
import { VisionBoardGrid } from "@/components/VisionBoardGrid";
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
import {
  GradientArea,
  PromptField,
  RadarChart,
  StepToneBackground,
  WheelScale,
} from "@/components/onboarding";
import {
  Body,
  DisplayTitle,
  GhostButton,
  IconLabel,
  Kicker,
  Label,
  PrimaryButton,
  SoftOrb,
} from "@/components/ui";
import {
  borders,
  colors,
  fonts,
  gradients,
  iconSizes,
  layout,
  opacity,
  radius,
  shadows,
  space,
  typeScale,
  withAlpha,
} from "@/src/theme";

export default function OnboardingScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === "1";
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

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;
  const progressCount = ONBOARDING_STEPS.length - 1;
  const visibleIndex = Math.min(stepIndex, progressCount - 1);

  const otherEntry = goals.find((s) => s === "Other" || s.startsWith("Other:")) ?? null;
  const hasOther = otherEntry !== null;
  const otherText = parseOtherGoal(otherEntry);

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

    if (r?.completed_at && !editing) {
      router.replace("/(app)/overview");
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
    if (editing) router.back();
    else router.replace("/(app)/overview");
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

  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const visionContentWidth = Math.min(
    windowWidth - layout.screenPadX * 2,
    layout.contentMaxWidth,
  );
  const ctaLabel = stepCta(step);
  const ctaDisabled = !canContinue() && step !== "done";
  const commitmentDisabled = !commitmentName.trim() || !!commitmentSignedAt;

  const scrollBody = (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: layout.screenPadTop + insets.top },
          step === "vision" && {
            flexGrow: 0,
            paddingBottom: layout.screenPadBottom + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={step === "vision"}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <Kicker style={styles.pageKicker}>The Feel Good Challenge · Onboarding</Kicker>
        <View style={styles.progressRow}>
          {Array.from({ length: progressCount }).map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i <= visibleIndex ? (
                <LinearGradient
                  colors={[...gradients.progress]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              ) : null}
            </View>
          ))}
        </View>

        <Kicker style={styles.stepEyebrow}>{stepEyebrow(step)}</Kicker>
        <DisplayTitle style={styles.title}>{stepTitle(step)}</DisplayTitle>
        {stepSubtitle(step) ? (
          <Body size="base" style={styles.subtitle}>
            {stepSubtitle(step)}
          </Body>
        ) : null}

        {step === "welcome" && (
          <GradientArea colorsStops={gradients.welcomeFoundation} contentStyle={styles.cardPad6}>
            <Body style={styles.cardBody}>
              Before Day 1, we&apos;ll spend a few minutes on the emotional foundation, why you&apos;re
              here, what you want to feel, and what success actually looks like for you. This
              is the part most challenges skip. It&apos;s what makes yours stick.
            </Body>
          </GradientArea>
        )}

        {step === "why" && (
          <View style={styles.promptStack}>
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
          </View>
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
                      <View style={[styles.goalChip, styles.goalChipActive]}>
                        <Label style={[styles.goalText, styles.goalTextActive]} numberOfLines={3}>
                          {g}
                        </Label>
                        <View style={styles.goalCheckOn}>
                          <Check size={10} color={colors.primary} strokeWidth={3} />
                        </View>
                      </View>
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
              <GradientArea
                colorsStops={[colors.card, withAlpha(colors.secondary, 0.3)]}
                style={styles.goalsOther}
                contentStyle={styles.goalsOtherInner}
              >
                <Kicker style={styles.goalsOtherLabel}>
                  Tell us what &quot;Other&quot; means to you
                </Kicker>
                <TextInput
                  style={styles.goalsOtherInput}
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder="In a few words…"
                  placeholderTextColor={withAlpha(colors.foreground, 0.3)}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
              </GradientArea>
            )}
          </View>
        )}

        {step === "commitment" && (
          <GradientArea
            colorsStops={gradients.commitment}
            contentStyle={styles.cardPad8}
            backdrop={
              <SoftOrb
                size={160}
                blur={40}
                color={colors.secondary}
                opacity={0.4}
                top={-64}
                right={-64}
              />
            }
          >
            <DisplayTitle size="sm" style={styles.pledge}>
              &ldquo;I commit to showing up for myself for the next 55 days.&rdquo;
            </DisplayTitle>
            <Kicker style={styles.commitmentKicker}>Type your name to sign</Kicker>
            <View style={styles.commitmentField}>
              <TextInput
                style={styles.commitmentInput}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                value={commitmentName}
                onChangeText={setCommitmentName}
                returnKeyType="done"
              />
            </View>
            <PrimaryButton
              label={commitmentSignedAt ? `Signed, ${commitmentName}` : "I agree"}
              onPress={signCommitment}
              disabled={commitmentDisabled}
              style={[
                styles.commitmentAgree,
                commitmentDisabled && styles.commitmentAgreeDisabled,
              ]}
            />
            {commitmentSignedAt ? (
              <Text style={styles.signedAt}>
                Signed {new Date(commitmentSignedAt).toLocaleString()}
              </Text>
            ) : null}
          </GradientArea>
        )}

        {step === "wheel" && (
          <>
            <GradientArea
              colorsStops={gradients.wheelCard}
              contentStyle={styles.cardPad6}
              backdrop={
                <SoftOrb
                  size={224}
                  blur={64}
                  color={colors.primary}
                  opacity={0.25}
                  top={-64}
                  right={-64}
                />
              }
            >
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
          <GradientArea colorsStops={gradients.whyStatement} contentStyle={styles.cardPad5}>
            <TextInput
              style={styles.whyStatementInput}
              placeholder="This matters to me because…"
              placeholderTextColor={withAlpha(colors.foreground, 0.3)}
              value={whyStatement}
              onChangeText={setWhyStatement}
              onBlur={() => saveResponses({ why_statement: whyStatement })}
              multiline
              textAlignVertical="top"
            />
          </GradientArea>
        )}

        {step === "vision" && (
          <VisionBoardGrid userId={uid} contentWidth={visionContentWidth} />
        )}

        {step === "letter" && (
          <>
            <GradientArea
              colorsStops={[colors.card, colors.background, withAlpha(colors.secondary, 0.4)]}
              contentStyle={styles.cardPad5}
            >
              <TextInput
                style={styles.letterInput}
                placeholder="Dear future me,"
                placeholderTextColor={withAlpha(colors.foreground, 0.3)}
                value={futureLetter}
                onChangeText={setFutureLetter}
                onBlur={() => saveResponses({ future_letter: futureLetter })}
                multiline
                textAlignVertical="top"
              />
            </GradientArea>
            <IconLabel
              style={styles.lockNoteTight}
              gap={space.sm}
              icon={<Lock size={iconSizes.xs} color={colors.mutedForeground} strokeWidth={2} />}
            >
              <Body size="sm">Sealed until Day 55.</Body>
            </IconLabel>
          </>
        )}

        {step === "done" && (
          <GradientArea
            colorsStops={gradients.doneHero}
            hairline={false}
            contentStyle={styles.cardPad8}
            backdrop={
              <SoftOrb
                size={224}
                blur={64}
                color={colors.card}
                opacity={0.3}
                top={-80}
                right={-80}
              />
            }
          >
            <Sparkles
              size={iconSizes.lg}
              color={colors.foreground}
              strokeWidth={2}
              style={styles.doneIcon}
            />
            <DisplayTitle size="sm" style={styles.doneLead}>
              Tomorrow is Day 1. Today, you chose yourself.
            </DisplayTitle>
            <Body style={styles.doneBody}>
              Your goals, your wheel, your why, your vision and your letter are saved. We&apos;ll
              bring them back to you at the moments that matter.
            </Body>
          </GradientArea>
        )}

        <View style={[styles.navRow, step === "done" && styles.navRowDone]}>
          {step !== "done" && (stepIndex > 0 || editing) ? (
            <GhostButton
              label="Back"
              onPress={stepIndex > 0 ? back : () => router.back()}
              style={styles.backBtn}
              leadingIcon={
                <ArrowLeft size={iconSizes.sm} color={colors.foreground70} strokeWidth={2} />
              }
            />
          ) : null}
          <PrimaryButton
            label={ctaLabel}
            onPress={next}
            style={step === "done" ? styles.doneCta : styles.nextCta}
            disabled={ctaDisabled}
            trailingIcon={
              step !== "done" ? (
                <ArrowRight
                  size={iconSizes.sm}
                  color={colors.primaryForeground}
                  strokeWidth={2}
                />
              ) : undefined
            }
          />
        </View>
      </ScrollView>
  );

  return (
    <View style={styles.root}>
      <StepToneBackground step={step} />
      {scrollBody}
    </View>
  );
}

function parseOtherGoal(entry: string | null): string {
  if (!entry || entry === "Other") return "";
  if (entry.startsWith("Other: ")) return entry.slice("Other: ".length);
  if (entry.startsWith("Other:")) return entry.slice("Other:".length);
  return "";
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
    wheel: "Rate where you are today across nine areas. You'll rate again on Day 55, this is how you rate yourself right now.",
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
  container: {
    paddingHorizontal: layout.screenPadX,
    paddingBottom: layout.screenPadBottom,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
    alignSelf: "center",
    flexGrow: 1,
  },
  pageKicker: {
    color: colors.foreground70,
    marginBottom: space.md,
  },
  progressRow: { flexDirection: "row", gap: 6, marginBottom: space["2xl"] },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.foreground, 0.1),
    overflow: "hidden",
  },
  progressFill: { flex: 1, height: "100%" },
  stepEyebrow: {
    color: colors.primary,
    marginBottom: space.md,
  },
  title: {
    fontSize: typeScale.stepTitle.fontSize,
    lineHeight: typeScale.stepTitle.lineHeight,
    letterSpacing: typeScale.stepTitle.letterSpacing,
    marginBottom: space.lg,
  },
  subtitle: { marginBottom: space["2xl"] },
  cardPad5: { padding: space.p5 },
  cardPad6: { padding: space.p6 },
  cardPad8: { padding: space.p8 },
  cardBody: {
    color: withAlpha(colors.foreground, 0.8),
    lineHeight: 23,
  },
  promptStack: { gap: space.p5 },
  goalsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  goalPressable: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  goalChip: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    padding: space.p4,
    borderRadius: radius["2xl"],
    backgroundColor: colors.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  goalChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.card,
  },
  goalText: {
    flex: 1,
    flexShrink: 1,
    color: colors.foreground,
    fontSize: typeScale.bodyMd.fontSize,
    lineHeight: 18,
    fontFamily: fonts.sansMedium,
  },
  goalTextActive: {
    color: colors.primaryForeground,
  },
  goalCheckOff: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    flexShrink: 0,
  },
  goalCheckOn: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  goalsOther: { marginTop: space.lg, borderRadius: radius["2xl"] },
  goalsOtherInner: { padding: space.lg },
  goalsOtherLabel: {
    marginBottom: space.sm,
    color: colors.mutedForeground,
  },
  goalsOtherInput: {
    minHeight: 96,
    backgroundColor: withAlpha(colors.card, 0.6),
    borderRadius: radius["2xl"],
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    paddingHorizontal: space.inputX,
    paddingVertical: space.md,
    fontFamily: fonts.sans,
    fontSize: typeScale.input.fontSize,
    lineHeight: typeScale.input.lineHeight,
    color: colors.foreground,
  },
  pledge: {
    fontSize: typeScale.quote.fontSize,
    lineHeight: typeScale.quote.lineHeight,
    letterSpacing: typeScale.quote.letterSpacing,
    marginBottom: space.xl,
  },
  commitmentKicker: {
    marginBottom: space.sm,
    color: colors.mutedForeground,
  },
  commitmentField: {
    backgroundColor: withAlpha(colors.card, 0.7),
    borderRadius: radius["2xl"],
    borderBottomWidth: borders.thick,
    borderBottomColor: withAlpha(colors.primary, 0.4),
    paddingHorizontal: space.inputX,
    paddingVertical: space.md,
    justifyContent: "center",
  },
  commitmentInput: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: typeScale.displayLg.fontSize,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  },
  commitmentAgree: {
    marginTop: space.xl,
    paddingVertical: space.md,
    shadowOpacity: 0,
    elevation: 0,
  },
  commitmentAgreeDisabled: {
    opacity: opacity.disabledSoft,
  },
  signedAt: {
    marginTop: space.md,
    fontFamily: fonts.sans,
    fontSize: typeScale.meta.fontSize,
    lineHeight: typeScale.meta.lineHeight,
    color: colors.mutedForeground,
  },
  wheelScales: { marginTop: space.p6, gap: space.lg },
  whyStatementInput: {
    minHeight: 160,
    backgroundColor: "transparent",
    fontFamily: fonts.sans,
    fontSize: typeScale.bodyBase.fontSize,
    lineHeight: typeScale.bodyBase.lineHeight,
    color: colors.foreground,
    padding: 0,
  },
  letterInput: {
    minHeight: 200,
    backgroundColor: "transparent",
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: typeScale.bodyBase.fontSize,
    lineHeight: typeScale.bodyBase.lineHeight,
    color: colors.foreground,
    padding: 0,
  },
  doneIcon: { marginBottom: space.lg },
  doneLead: {
    fontSize: typeScale.quote.fontSize,
    lineHeight: typeScale.quote.lineHeight,
    letterSpacing: typeScale.quote.letterSpacing,
    marginBottom: space.lg,
  },
  doneBody: {
    color: withAlpha(colors.foreground, 0.85),
    lineHeight: 23,
  },
  lockNoteTight: { marginTop: space.md },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.lg,
    marginTop: layout.screenPadTop,
  },
  navRowDone: { marginTop: space["2xl"] },
  backBtn: { gap: space.xs },
  nextCta: { paddingVertical: 14 },
  doneCta: { flex: 1, paddingVertical: space.lg },
});
