import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowRight, Check, Lock } from "@/components/ui/icons";
import {
  CHALLENGE_LENGTH,
  WHEEL_DIMENSIONS,
  checkInsCount,
  completedDaysCount,
  currentDay,
  emptyWheel,
  longestStreak,
  biggestShifts,
  scoresToWheelRow,
  wheelRowToScores,
  type DailyEntry,
  type Profile,
  type WheelKey,
  type WheelScores,
} from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { submitTestimonial } from "@/lib/api";
import {
  Body,
  BrandCard,
  DisplayTitle,
  GradientCard,
  Kicker,
  Label,
  OutlineButton,
  PrimaryButton,
  Screen,
  StatValue,
} from "@/components/ui";
import {
  borders,
  colors,
  fonts,
  gradients,
  iconSizes,
  radius,
  space,
  typeScale,
  withAlpha,
} from "@/src/theme";

export default function CompleteScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [day1, setDay1] = useState<WheelScores>(emptyWheel());
  const [day55, setDay55] = useState<WheelScores>(emptyWheel());
  const [step, setStep] = useState<"rewheel" | "reveal">("rewheel");
  const [letter, setLetter] = useState("");
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [rating, setRating] = useState(0);
  const [story, setStory] = useState("");
  const [permissionToPublish, setPermissionToPublish] = useState(true);
  const [visionUrls, setVisionUrls] = useState<string[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const uid = auth.user.id;
    const [{ data: p }, { data: wheels }, { data: onboarding }, { data: rows }, { data: vision }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("transformation_wheel").select("*").eq("user_id", uid),
        supabase.from("onboarding_responses").select("future_letter").eq("user_id", uid).maybeSingle(),
        supabase.from("daily_entries").select("*").eq("user_id", uid),
        supabase.from("vision_board_items").select("storage_path").eq("user_id", uid).order("sort_order"),
      ]);
    setProfile(p as Profile);
    setEntries((rows ?? []) as DailyEntry[]);
    setLetter(onboarding?.future_letter ?? "");
    const w1 = wheels?.find((w) => w.phase === "day_1");
    const w55 = wheels?.find((w) => w.phase === "day_55");
    if (w1) setDay1(wheelRowToScores(w1 as Record<string, number>));
    if (w55) {
      setDay55(wheelRowToScores(w55 as Record<string, number>));
      setStep("reveal");
    }
    const urls: string[] = [];
    for (const item of vision ?? []) {
      const { data: signed } = await supabase.storage
        .from("vision-board")
        .createSignedUrl(item.storage_path, 3600);
      if (signed?.signedUrl) urls.push(signed.signedUrl);
    }
    setVisionUrls(urls);
  }

  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const daysLeft = Math.max(0, CHALLENGE_LENGTH - day);
  const shifts = useMemo(() => biggestShifts(day1, day55), [day1, day55]);
  const fullDays = completedDaysCount(entries);
  const displayName = profile?.display_name?.split(/\s+/)[0] || "you";

  if (day < CHALLENGE_LENGTH) {
    return (
      <Screen>
        <View style={styles.center}>
          <BrandCard style={styles.lockCard}>
            <View style={styles.lockTile}>
              <Lock size={iconSizes.lg} color={colors.primary} strokeWidth={2} />
            </View>
            <Kicker style={styles.lockKicker}>Sealed until Day {CHALLENGE_LENGTH}</Kicker>
            <DisplayTitle style={styles.lockTitle}>Not yet.</DisplayTitle>
            <Body style={styles.lockBody}>
              Your completion reveal — the before-and-after wheel, your Future You letter, and your transformation — unlocks on Day {CHALLENGE_LENGTH}.
            </Body>
            <View style={styles.dayBox}>
              <Kicker>You&apos;re on</Kicker>
              <StatValue size="lg" style={styles.dayBig}>Day {day}</StatValue>
              <Body size="sm">
                {daysLeft} day{daysLeft === 1 ? "" : "s"} to go.
              </Body>
            </View>
            <PrimaryButton
              label="Back to today"
              onPress={() => router.back()}
              style={styles.lockCta}
              trailingIcon={
                <ArrowRight
                  size={iconSizes.sm}
                  color={colors.primaryForeground}
                  strokeWidth={2}
                />
              }
            />
          </BrandCard>
        </View>
      </Screen>
    );
  }

  async function saveDay55() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase
      .from("transformation_wheel")
      .upsert(scoresToWheelRow(auth.user.id, "day_55", day55), { onConflict: "user_id,phase" });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setStep("reveal");
  }

  async function shareSummary() {
    const summary = `I completed The Feel Good Society 55-Day Challenge.\n${completedDaysCount(entries)} full days · ${longestStreak(entries)}-day streak`;
    await Share.share({ message: summary });
  }

  async function sendReview() {
    try {
      await submitTestimonial({ rating, story, permissionToPublish });
      Alert.alert("Thank you", "Your review was submitted.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Submit failed");
    }
  }

  if (step === "rewheel") {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Kicker>Day 55 · Rewheel</Kicker>
          <DisplayTitle size="sm" style={styles.title}>Rate yourself again.</DisplayTitle>
          <Body style={{ marginBottom: space.lg }}>
            Move each area to where you are now. Your Day 1 scores stay hidden — you&apos;ll see the full before-and-after on the next screen.
          </Body>
          <BrandCard>
            {WHEEL_DIMENSIONS.map((d) => {
              const key = d.key as WheelKey;
              return (
                <View key={key} style={{ marginBottom: 10 }}>
                  <Label numberOfLines={2} style={styles.scaleLabel}>
                    {d.label}: {day55[key]}/10
                  </Label>
                  <View style={styles.scaleRow}>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const n = i + 1;
                      return (
                        <Pressable
                          key={n}
                          style={[styles.scaleDot, n <= day55[key] && styles.scaleDotActive]}
                          onPress={() => setDay55({ ...day55, [key]: n })}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </BrandCard>
          <PrimaryButton
            label="See your transformation"
            onPress={saveDay55}
            style={{ marginTop: space.lg }}
          />
        </ScrollView>
      </Screen>
    );
  }

  const completeScroll = (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <GradientCard
          colorsStops={gradients.completeSoft}
          style={styles.hero}
          contentStyle={styles.heroContent}
        >
          <Kicker style={styles.heroKicker}>Day 55 · Complete</Kicker>
          <DisplayTitle size="lg" style={styles.heroTitle}>
            You did it, {displayName}.
          </DisplayTitle>
          <Body>55 days. {fullDays} full completions. A different you.</Body>
        </GradientCard>

        <View style={styles.statsRow}>
          <BrandCard style={styles.statCard}>
            <Kicker>Full days</Kicker>
            <StatValue size="md" style={styles.statValue}>{fullDays}</StatValue>
          </BrandCard>
          <BrandCard style={styles.statCard}>
            <Kicker>Longest streak</Kicker>
            <StatValue size="md" style={styles.statValue}>{longestStreak(entries)}</StatValue>
          </BrandCard>
          <BrandCard style={styles.statCard}>
            <Kicker>Check-ins</Kicker>
            <StatValue size="md" style={styles.statValue}>{checkInsCount(entries)}</StatValue>
          </BrandCard>
        </View>

        <Kicker style={styles.shiftsKicker}>Before vs after</Kicker>
        <DisplayTitle size="sm" style={styles.section}>Biggest shifts</DisplayTitle>
        {shifts.map((s) => (
          <BrandCard key={s.key} style={styles.shiftCard}>
            <Body style={styles.shift}>
              {s.label}: {s.from} → {s.to}
            </Body>
          </BrandCard>
        ))}

        {letter ? (
          <BrandCard style={{ marginVertical: space.lg }}>
            <Kicker>Your letter, delivered</Kicker>
            <DisplayTitle size="sm" style={styles.letter}>&ldquo;{letter}&rdquo;</DisplayTitle>
          </BrandCard>
        ) : null}

        {visionUrls.length > 0 && (
          <>
            <DisplayTitle size="sm" style={styles.section}>Your vision board</DisplayTitle>
            <View style={styles.visionGrid}>
              {visionUrls.map((url) => (
                <Image key={url} source={{ uri: url }} style={styles.visionImage} />
              ))}
            </View>
          </>
        )}

        <OutlineButton label="Share your transformation" onPress={shareSummary} style={{ marginTop: space.md }} />

        <Kicker style={{ marginTop: space.xl }}>Leave a review</Kicker>
        <DisplayTitle size="sm" style={styles.section}>Share your story.</DisplayTitle>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Text style={{ fontSize: 28, color: n <= rating ? colors.accent : colors.border }}>★</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Your story"
          placeholderTextColor={colors.mutedForeground}
          value={story}
          onChangeText={setStory}
          multiline
        />
        <Pressable
          style={styles.permissionRow}
          onPress={() => setPermissionToPublish((v) => !v)}
        >
          <View style={[styles.checkbox, permissionToPublish && styles.checkboxOn]}>
            {permissionToPublish ? (
              <Check size={iconSizes.xs} color={colors.primaryForeground} strokeWidth={2.5} />
            ) : null}
          </View>
          <Body style={{ flex: 1 }}>Allow Feel Good Society to publish my review</Body>
        </Pressable>
        <PrimaryButton label="Submit review" onPress={sendReview} />
      </ScrollView>
  );

  return (
    <Screen>
      {completeScroll}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { paddingTop: space.lg, paddingBottom: 48 },
  title: { marginTop: space.sm, marginBottom: space.sm },
  lockCard: { alignItems: "center", width: "100%", padding: space.p8 },
  lockTile: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.primary, 0.1),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  lockKicker: { marginBottom: space.sm },
  lockTitle: { textAlign: "center", marginBottom: space.md },
  lockBody: { textAlign: "center", marginBottom: space.p6 },
  lockCta: { width: "100%", paddingVertical: space.md },
  dayBox: {
    width: "100%",
    backgroundColor: withAlpha(colors.muted, 0.4),
    borderRadius: radius["2xl"],
    padding: space.p4,
    alignItems: "center",
    marginBottom: space.p6,
  },
  dayBig: {
    marginTop: space.xs,
    marginBottom: space.xs,
    fontSize: typeScale.display4xl.fontSize,
    lineHeight: 42,
  },
  hero: { padding: space.p8 },
  heroContent: { alignItems: "center" },
  heroKicker: { color: colors.primary, marginBottom: space.sm },
  heroTitle: { textAlign: "center", marginBottom: space.md },
  statsRow: { flexDirection: "row", gap: space.md, marginVertical: space.p6 },
  statCard: {
    flex: 1,
    padding: space.p4,
    borderRadius: radius["2xl"],
    alignItems: "center",
  },
  statValue: {
    marginTop: space.xs,
  },
  section: { marginBottom: space.sm },
  shiftsKicker: { marginBottom: space.sm },
  shiftCard: { marginBottom: space.sm, padding: space.p4 },
  shift: { color: colors.foreground },
  letter: {
    marginTop: space.sm,
    lineHeight: 28,
  },
  scaleLabel: { marginBottom: 0 },
  scaleRow: { flexDirection: "row", gap: space.xs, marginTop: space.xs },
  scaleDot: {
    flex: 1,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  scaleDotActive: { backgroundColor: colors.primary },
  stars: { flexDirection: "row", gap: space.sm, marginVertical: space.sm },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: space.inputX,
    paddingVertical: space.md,
    minHeight: 100,
    marginBottom: space.md,
    fontFamily: fonts.sans,
    fontSize: typeScale.input.fontSize,
    lineHeight: typeScale.bodyMd.lineHeight,
    color: colors.foreground,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    textAlignVertical: "top",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 8 },
  visionImage: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
});
