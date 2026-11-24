import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
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
import { VisionBoardGrid } from "@/components/VisionBoardGrid";
import { ArrowLeft } from "@/components/ui/icons";
import { Body, DisplayTitle, IconLabel, Kicker, Screen } from "@/components/ui";
import { colors, layout, space } from "@/src/theme";

export default function ProgressScreen() {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { width: windowWidth } = useWindowDimensions();

  const contentWidth = Math.min(windowWidth - space.screenX * 2, layout.contentMaxWidth);

  const load = useCallback(async () => {
    await flushOfflineQueue();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? null;
    setUid(userId);
    if (!userId) {
      setLoading(false);
      return;
    }

    const [{ data: p }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .limit(CHALLENGE_LENGTH + 5),
    ]);

    setProfile(p as Profile | null);
    setEntries((rows ?? []) as DailyEntry[]);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const streak = useMemo(() => computeStreak(entries), [entries]);
  const completed = useMemo(() => completedDaysCount(entries), [entries]);

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
        <Pressable onPress={() => router.back()}>
          <IconLabel
            gap={6}
            icon={<ArrowLeft size={14} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>Settings</Kicker>
          </IconLabel>
        </Pressable>

        <DisplayTitle size="lg" style={styles.title}>My progress</DisplayTitle>
        <Body style={styles.lead}>
          Day {day} of {CHALLENGE_LENGTH}. Your vision board and every day of the challenge in one
          place.
        </Body>

        <ChallengeStats streak={streak} completed={completed} />

        <DisplayTitle size="sm" style={styles.section}>
          Your vision board
        </DisplayTitle>
        <VisionBoardGrid userId={uid} contentWidth={contentWidth} />

        <DisplayTitle size="sm" style={styles.section}>
          All {CHALLENGE_LENGTH} days
        </DisplayTitle>
        <ChallengeGrid
          profile={profile}
          entries={entries}
          currentDay={day}
          onPressDay={onPressDay}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingTop: space.lg, paddingBottom: 48 },
  title: { marginTop: space.md },
  lead: { marginTop: space.sm, marginBottom: space.p6 },
  section: { marginTop: space.xl, marginBottom: space.lg },
});
