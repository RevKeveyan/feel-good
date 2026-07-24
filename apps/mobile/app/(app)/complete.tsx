import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
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
import { colors, fonts, gradients, radius, space } from "@/src/theme";

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
          <BrandCard style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.lockTile}>
              <Lock size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Kicker style={{ marginBottom: 8 }}>Sealed until Day {CHALLENGE_LENGTH}</Kicker>
            <DisplayTitle style={{ textAlign: "center" }}>Not yet.</DisplayTitle>
            <Body style={{ textAlign: "center", marginTop: 8, marginBottom: 16 }}>
              Your completion reveal — the before-and-after wheel, your Future You letter, and your transformation — unlocks on Day {CHALLENGE_LENGTH}.
            </Body>
            <View style={styles.dayBox}>
              <Kicker>You&apos;re on</Kicker>
              <StatValue size="lg" style={styles.dayBig}>Day {day}</StatValue>
              <Body>
                {daysLeft} day{daysLeft === 1 ? "" : "s"} to go.
              </Body>
            </View>
            <PrimaryButton
              label="Back to today"
              onPress={() => router.back()}
              style={{ width: "100%" }}
              trailingIcon={<ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2} />}
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GradientCard colorsStops={gradients.score} orb>
          <Kicker>Day 55 · Complete</Kicker>
          <DisplayTitle size="lg" style={{ marginTop: 4 }}>
            You did it, {displayName}.
          </DisplayTitle>
          <Body style={{ marginTop: 8 }}>
            55 days. {fullDays} full completions. A different you.
          </Body>
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

        <Kicker style={{ marginBottom: 8 }}>Before vs after</Kicker>
        <DisplayTitle size="sm" style={styles.section}>Biggest shifts</DisplayTitle>
        {shifts.map((s) => (
          <BrandCard key={s.key} style={{ marginBottom: 8, padding: 14 }}>
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
              <Check size={14} color={colors.primaryForeground} strokeWidth={2.5} />
            ) : null}
          </View>
          <Body style={{ flex: 1 }}>Allow Feel Good Society to publish my review</Body>
        </Pressable>
        <PrimaryButton label="Submit review" onPress={sendReview} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { paddingTop: space.lg, paddingBottom: 48 },
  title: { marginTop: 8, marginBottom: 8 },
  lockTile: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dayBox: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: radius["2xl"],
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  dayBig: { marginVertical: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginVertical: space.lg },
  statCard: { flex: 1, padding: 12, alignItems: "center" },
  statValue: {
    marginTop: 4,
  },
  section: { marginBottom: 8 },
  shift: { color: colors.foreground },
  letter: {
    marginTop: 8,
    lineHeight: 28,
  },
  scaleLabel: { marginBottom: 0 },
  scaleRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  scaleDot: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
  scaleDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stars: { flexDirection: "row", gap: 8, marginVertical: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
    fontFamily: fonts.sans,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.ringHairline,
    textAlignVertical: "top",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
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
