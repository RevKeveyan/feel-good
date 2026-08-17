import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Camera, CheckCircle2, Lock } from "@/components/ui/icons";
import {
  CHALLENGE_LENGTH,
  currentDay,
  dailyScore,
  entryDateForChallengeDay,
  formatDate,
  habitsComplete,
  isCheckInComplete,
  isDayComplete,
  type DailyEntry,
  type Profile,
} from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { cacheBustUrl } from "@/lib/upload-image";
import {
  Body,
  BrandCard,
  DisplayTitle,
  HabitToggle,
  HydrateCard,
  IconLabel,
  Kicker,
  Label,
  Screen,
} from "@/components/ui";
import { borders, colors, iconSizes, radius, space, typeScale } from "@/src/theme";

const HYDRATE_POINTS = 36;

function parseDay(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > CHALLENGE_LENGTH) return null;
  return n;
}

export default function PastDayScreen() {
  const params = useLocalSearchParams<{ day: string }>();
  const dayNum = parseDay(params.day);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (dayNum == null) {
      router.replace("/(app)/overview");
      return;
    }
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const profileRow = p as Profile | null;
    if (profileRow && !profileRow.onboarding_completed_at) {
      router.replace("/(app)/onboarding");
      return;
    }
    if (!profileRow) {
      setLoading(false);
      return;
    }

    const current = currentDay(profileRow.challenge_start_date);
    if (dayNum > current) {
      router.replace("/(app)/overview");
      return;
    }
    if (dayNum === current) {
      router.replace("/(app)/today");
      return;
    }

    const iso = entryDateForChallengeDay(profileRow.challenge_start_date, dayNum);
    const week = Math.max(1, Math.min(8, Math.ceil(dayNum / 7)));
    const [{ data: row }, { data: photo }] = await Promise.all([
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", uid)
        .eq("entry_date", iso)
        .maybeSingle(),
      supabase
        .from("weekly_photos")
        .select("storage_path")
        .eq("user_id", uid)
        .eq("week_number", week)
        .maybeSingle(),
    ]);

    setProfile(profileRow);
    setEntry((row as DailyEntry | null) ?? null);
    if (photo?.storage_path) {
      const { data: signed } = await supabase.storage
        .from("weekly-photos")
        .createSignedUrl(photo.storage_path, 3600);
      setPhotoUrl(cacheBustUrl(signed?.signedUrl) ?? null);
    } else {
      setPhotoUrl(null);
    }
    setLoading(false);
  }, [dayNum]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading || dayNum == null || !profile) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Loading…</Body>
        </View>
      </Screen>
    );
  }

  const iso = entryDateForChallengeDay(profile.challenge_start_date, dayNum);
  const target = profile.water_target_ml ?? 2500;
  const score = dailyScore(entry, target);
  const habits = habitsComplete(entry, target);
  const checkInDone = isCheckInComplete(entry);
  const week = Math.max(1, Math.min(8, Math.ceil(dayNum / 7)));

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.replace("/(app)/overview")}>
          <IconLabel
            gap={6}
            icon={<ArrowLeft size={14} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>All days</Kicker>
          </IconLabel>
        </Pressable>

        <Kicker style={{ marginTop: space.md }}>{formatDate(iso)}</Kicker>
        <View style={styles.dayRow}>
          <DisplayTitle style={styles.dayTitle}>Day {dayNum}</DisplayTitle>
          <Body size="sm" style={styles.dayMuted}>
            of {CHALLENGE_LENGTH}
          </Body>
        </View>
        <Body style={{ marginTop: 6, marginBottom: space.lg }}>
          Read only. Logging is only open for today.
        </Body>

        {!entry ? (
          <BrandCard style={styles.empty}>
            <Label>No check-in was logged for this day.</Label>
          </BrandCard>
        ) : null}

        <View style={styles.sectionHeader}>
          <DisplayTitle size="sm" style={styles.sectionTitle}>
            The Feel Good Five
          </DisplayTitle>
          <Kicker>
            {habits} of 5 · score {score}
          </Kicker>
        </View>

        <View style={styles.habitStack}>
        <HabitToggle
          title="Nourish"
          done={!!entry?.nourish}
          subtitle={entry?.nourish ? "Personalised plan followed" : "Not logged"}
          disabled
          points={16}
        />
        <HabitToggle
          title="Fuel"
          done={!!entry?.fuel}
          subtitle={entry?.fuel ? "Pods & powders taken" : "Not logged"}
          disabled
          points={16}
        />
        <HabitToggle
          title="Move"
          done={!!entry?.move_done}
          subtitle={
            entry?.move_done && entry.move_type
              ? `${entry.move_type} · ${entry.move_minutes ?? 0}m`
              : "Not logged"
          }
          disabled
          points={16}
        />
        <HabitToggle
          title="Mindset"
          done={!!entry?.mindset}
          subtitle={entry?.mindset_type ?? "Not logged"}
          disabled
          points={16}
        />

        <HydrateCard
          waterMl={entry?.water_ml ?? 0}
          targetMl={target}
          points={HYDRATE_POINTS}
        />
        </View>

        <View style={[styles.checkInCard, checkInDone && styles.checkInDone]}>
          <View style={styles.checkInKickerRow}>
            {checkInDone ? (
              <CheckCircle2 size={14} color={colors.primary} strokeWidth={2} />
            ) : (
              <Lock size={14} color={colors.mutedForeground} strokeWidth={2} />
            )}
            <Kicker>
              {checkInDone ? "Daily check-in complete" : "Check-in not logged"}
            </Kicker>
          </View>
          {checkInDone ? (
            <View style={{ marginTop: 10, gap: 6 }}>
              <Body size="sm">Energy {entry?.energy}/10</Body>
              <Body size="sm">Mood {entry?.mood}/10</Body>
              <Body size="sm">Stress {entry?.stress}/10</Body>
              <Body size="sm">Motivation {entry?.motivation}/10</Body>
              {entry?.sleep_quality != null ? (
                <Body size="sm">Sleep {entry.sleep_quality}/10</Body>
              ) : null}
              {entry?.notes ? <Body size="sm">{entry.notes}</Body> : null}
            </View>
          ) : (
            <Body size="sm" style={{ marginTop: 8 }}>
              This day was not marked complete.
            </Body>
          )}
        </View>

        <BrandCard style={styles.photoCard}>
          <View style={styles.photoHeader}>
            <View style={styles.headerCopy}>
              <Kicker>Week {week} of 8</Kicker>
              <DisplayTitle size="sm" style={styles.photoTitle}>
                Weekly progress photo
              </DisplayTitle>
            </View>
            <Camera size={iconSizes.md} color={colors.primary} strokeWidth={2} />
          </View>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
          ) : (
            <Body size="sm">No photo for this week.</Body>
          )}
        </BrandCard>

        {isDayComplete(entry) ? <Label style={styles.completeBadge}>Day complete</Label> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingTop: space.lg, paddingBottom: 48 },
  dayRow: { marginTop: 4, flexDirection: "row", alignItems: "flex-end", gap: 8, flexWrap: "wrap" },
  dayTitle: {
    fontSize: typeScale.display3xl.fontSize,
    lineHeight: typeScale.display3xl.lineHeight,
    letterSpacing: typeScale.display3xl.letterSpacing,
  },
  dayMuted: {
    fontSize: typeScale.bodyLg.fontSize,
    fontStyle: "normal",
    lineHeight: 24,
    marginBottom: 3,
    color: colors.mutedForeground,
  },
  empty: { marginBottom: space.lg, padding: space.p4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: space.lg,
    gap: space.md,
  },
  sectionTitle: { marginBottom: 0 },
  habitStack: { gap: space.md, marginBottom: space["2xl"] },
  headerCopy: { flex: 1 },
  checkInCard: {
    backgroundColor: colors.card,
    borderRadius: radius["3xl"],
    padding: space.p6,
    marginBottom: space["2xl"],
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
  },
  checkInDone: {},
  checkInKickerRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  photoCard: { borderRadius: radius["3xl"], padding: space.p6 },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.lg,
  },
  photoTitle: { marginTop: space.xs },
  photoPreview: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius["2xl"],
    backgroundColor: colors.muted,
  },
  completeBadge: { textAlign: "center", marginTop: space.md, color: colors.primary },
});
