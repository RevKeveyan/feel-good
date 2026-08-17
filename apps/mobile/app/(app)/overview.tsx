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
import {
  Body,
  DisplayTitle,
  Kicker,
  PrimaryButton,
  Screen,
} from "@/components/ui";
import { colors, space } from "@/src/theme";

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

    const profileRow = p as Profile | null;
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
        <Kicker>The Feel Good Challenge</Kicker>
        <DisplayTitle style={styles.title}>All days</DisplayTitle>
        <Body style={styles.lead}>
          Day {day} of {CHALLENGE_LENGTH}. Open today to log, or look back at a day you have already
          reached.
        </Body>

        <ChallengeStats streak={streak} completed={completed} />

        <PrimaryButton
          label="Open today"
          onPress={() => router.push("/(app)/today")}
          style={{ marginBottom: space.lg }}
        />

        <ChallengeGrid
          profile={profile}
          entries={allEntries}
          currentDay={day}
          onPressDay={onPressDay}
        />

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
  title: { marginTop: space.xs },
  lead: { marginTop: space.sm, marginBottom: space.p6 },
  settings: { alignItems: "center", paddingVertical: space.lg },
  settingsText: { color: colors.mutedForeground },
});
