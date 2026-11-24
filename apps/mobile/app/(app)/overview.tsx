import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  CHALLENGE_LENGTH,
  completedDaysCount,
  computeStreak,
  currentDay,
  type DailyEntry,
  type DayAvailability,
  type Profile,
} from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { flushOfflineQueue } from "@/lib/offline-queue";
import { ChallengeGrid, ChallengeStats } from "@/components/ChallengeGrid";
import { ContactUs } from "@/components/ContactUs";
import {
  Body,
  BrandWordmark,
  DarkButton,
  DisplayTitle,
  Kicker,
  Screen,
} from "@/components/ui";
import { colors, space, typeScale } from "@/src/theme";

export default function OverviewScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    await flushOfflineQueue();
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    const [{ data: p }, { data: entries }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", uid)
        .order("entry_date", { ascending: false })
        .limit(CHALLENGE_LENGTH + 5),
    ]);

    const profileRow = p
      ? ({
          ...(p as Profile),
          challenge_status: (p as Profile).challenge_status ?? "awaiting",
          clinic_status: (p as Profile).clinic_status ?? "awaiting",
        } as Profile)
      : null;
    if (profileRow && !profileRow.onboarding_completed_at) {
      setLoading(false);
      router.replace("/(app)/onboarding");
      return;
    }

    setProfile(profileRow);
    setAllEntries((entries ?? []) as DailyEntry[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const streak = useMemo(() => computeStreak(allEntries), [allEntries]);
  const completed = useMemo(() => completedDaysCount(allEntries), [allEntries]);

  function onPressDay(n: number, status: DayAvailability) {
    if (status === "future") {
      Alert.alert("Not yet", "This day unlocks when you reach it.");
      return;
    }
    if (status === "today") {
      router.push("/(app)/today");
      return;
    }
    router.push({ pathname: "/(app)/day/[day]", params: { day: String(n) } });
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <Body>Loading…</Body>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Kicker>Challenge</Kicker>
            <DisplayTitle size="lg" style={styles.title}>
              All days
            </DisplayTitle>
          </View>
          <BrandWordmark size="header" />
        </View>
        <Body style={styles.lead}>
          Day {day} of {CHALLENGE_LENGTH}. Open today to log, or look back at a day you have already
          reached.
        </Body>

        <ChallengeStats streak={streak} completed={completed} />

        <DarkButton
          label="Open today"
          onPress={() => router.push("/(app)/today")}
          style={styles.openToday}
        />

        <ChallengeGrid
          profile={profile}
          entries={allEntries}
          currentDay={day}
          onPressDay={onPressDay}
          onPressFinalCheckIn={() => router.push("/(app)/complete")}
        />

        <ContactUs />

        <Pressable style={styles.settings} onPress={() => router.push("/(app)/choose")}>
          <Kicker style={styles.settingsText}>Areas</Kicker>
        </Pressable>
        <Pressable style={styles.settings} onPress={() => router.push("/(app)/settings")}>
          <Kicker style={styles.settingsText}>Settings</Kicker>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingTop: space.lg, paddingBottom: 48 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  headerCopy: { flex: 1 },
  title: {
    marginTop: space.xs,
    fontSize: typeScale.display2xl.fontSize,
    lineHeight: typeScale.display2xl.lineHeight,
  },
  lead: { marginTop: space.md, marginBottom: space.p6 },
  openToday: { marginBottom: space["2xl"], paddingVertical: space.lg },
  settings: { alignItems: "center", paddingVertical: space.lg },
  settingsText: { color: colors.mutedForeground },
});
