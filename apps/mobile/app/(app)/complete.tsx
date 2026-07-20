import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
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
  OutlineButton,
  PrimaryButton,
  Screen,
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
  const shifts = useMemo(() => biggestShifts(day1, day55), [day1, day55]);

  if (day < CHALLENGE_LENGTH) {
    return (
      <Screen>
        <View style={styles.center}>
          <BrandCard style={{ alignItems: "center", width: "100%" }}>
            <Text style={styles.lock}>🔒</Text>
            <DisplayTitle style={{ fontSize: 32, textAlign: "center" }}>Not yet.</DisplayTitle>
            <Body style={{ textAlign: "center", marginTop: 8, marginBottom: 20 }}>
              Sealed until Day {CHALLENGE_LENGTH}. You&apos;re on Day {day}.
            </Body>
            <PrimaryButton label="Back to Today" onPress={() => router.back()} style={{ width: "100%" }} />
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
      await submitTestimonial({ rating, story, permissionToPublish: true });
      Alert.alert("Thank you", "Your review was submitted.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Submit failed");
    }
  }

  if (step === "rewheel") {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Kicker>Day 55</Kicker>
          <DisplayTitle style={styles.title}>Rate yourself again</DisplayTitle>
          <Body style={{ marginBottom: space.lg }}>Compare with Day 1 and see your shifts.</Body>
          <BrandCard>
            {WHEEL_DIMENSIONS.map((d) => {
              const key = d.key as WheelKey;
              return (
                <View key={key} style={{ marginBottom: 10 }}>
                  <Text style={styles.scaleLabel}>
                    {d.label}: {day55[key]}/10
                  </Text>
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
          <Kicker>Transformation</Kicker>
          <DisplayTitle style={{ fontSize: 36, marginTop: 4 }}>You did it.</DisplayTitle>
          <Text style={styles.tagline}>WE DO GOOD THINGS HERE</Text>
        </GradientCard>

        <View style={styles.statsRow}>
          <BrandCard style={styles.statCard}>
            <Kicker>Days</Kicker>
            <Text style={styles.statValue}>{completedDaysCount(entries)}</Text>
          </BrandCard>
          <BrandCard style={styles.statCard}>
            <Kicker>Streak</Kicker>
            <Text style={styles.statValue}>{longestStreak(entries)}</Text>
          </BrandCard>
          <BrandCard style={styles.statCard}>
            <Kicker>Check-ins</Kicker>
            <Text style={styles.statValue}>{checkInsCount(entries)}</Text>
          </BrandCard>
        </View>

        <DisplayTitle style={styles.section}>Biggest shifts</DisplayTitle>
        {shifts.map((s) => (
          <BrandCard key={s.key} style={{ marginBottom: 8, padding: 14 }}>
            <Text style={styles.shift}>
              {s.label}: {s.from} → {s.to}
            </Text>
          </BrandCard>
        ))}

        {letter ? (
          <BrandCard style={{ marginVertical: space.lg }}>
            <Kicker>Letter to Future You</Kicker>
            <Text style={styles.letter}>&ldquo;{letter}&rdquo;</Text>
          </BrandCard>
        ) : null}

        {visionUrls.length > 0 && (
          <>
            <DisplayTitle style={styles.section}>Your vision board</DisplayTitle>
            <View style={styles.visionGrid}>
              {visionUrls.map((url) => (
                <Image key={url} source={{ uri: url }} style={styles.visionImage} />
              ))}
            </View>
          </>
        )}

        <OutlineButton label="Share transformation" onPress={shareSummary} style={{ marginTop: space.md }} />

        <DisplayTitle style={[styles.section, { marginTop: space.xl }]}>Leave a review</DisplayTitle>
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
        <PrimaryButton label="Submit review" onPress={sendReview} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { paddingTop: space.lg, paddingBottom: 48 },
  title: { fontSize: 28, marginTop: 8, marginBottom: 8 },
  lock: { fontSize: 28, marginBottom: 8 },
  tagline: {
    marginTop: 16,
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.mutedForeground,
  },
  statsRow: { flexDirection: "row", gap: 8, marginVertical: space.lg },
  statCard: { flex: 1, padding: 12, alignItems: "center" },
  statValue: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 24,
    color: colors.foreground,
    marginTop: 4,
  },
  section: { fontSize: 22, marginBottom: 8 },
  shift: { fontFamily: fonts.sans, color: colors.foreground },
  letter: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 24,
    color: colors.foreground,
  },
  scaleLabel: { fontFamily: fonts.sansSemi, color: colors.foreground },
  scaleRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  scaleDot: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.border,
    textAlignVertical: "top",
  },
  visionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 8 },
  visionImage: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
});
