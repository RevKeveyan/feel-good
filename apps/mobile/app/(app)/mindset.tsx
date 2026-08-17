import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Headphones, Lock, Pause, Play } from "@/components/ui/icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import {
  MINDSET_CATEGORIES,
  MINDSET_TRACKS,
  getMindsetAudioUrl,
  type MindsetCategory,
} from "@feelgood/shared";
import { Body, DisplayTitle, IconLabel, Kicker, Label, Screen } from "@/components/ui";
import { borders, colors, iconSizes, radius, space, typeScale, fonts } from "@/src/theme";

const audioBase = process.env.EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL ?? null;

export default function MindsetScreen() {
  const [category, setCategory] = useState<MindsetCategory | "All">("All");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "duckOthers",
    });
  }, []);

  useEffect(() => {
    if (status.didJustFinish) setPlayingId(null);
  }, [status.didJustFinish]);

  const groups = useMemo(() => {
    const visibleCategories =
      category === "All" ? MINDSET_CATEGORIES : ([category] as readonly MindsetCategory[]);
    return visibleCategories
      .map((cat) => ({
        category: cat,
        tracks: MINDSET_TRACKS.filter((t) => t.category === cat).map((t) => ({
          ...t,
          audioUrl: getMindsetAudioUrl(t.day, audioBase),
        })),
      }))
      .filter((group) => group.tracks.length > 0);
  }, [category]);

  function togglePlay(trackId: number, url: string | null) {
    if (!url) return;
    if (playingId === trackId) {
      player.pause();
      setPlayingId(null);
      return;
    }
    player.replace({ uri: url });
    player.play();
    setPlayingId(trackId);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <IconLabel
            gap={6}
            icon={<ArrowLeft size={iconSizes.xs} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>Back to today</Kicker>
          </IconLabel>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconTile}>
            <Headphones size={iconSizes.md} color={colors.foreground} strokeWidth={2} />
          </View>
          <View style={styles.headerCopy}>
            <Kicker>21-Day Mindset Rewire</Kicker>
            <DisplayTitle size="sm" style={styles.headerTitle}>
              One Session. One Moment.
            </DisplayTitle>
            <Body size="sm" style={styles.headerBody}>
              Guided tracks designed to strengthen confidence, nurture emotional wellbeing and cultivate calm - helping you feel good, for good.
            </Body>
          </View>
        </View>

        <View style={styles.chips}>
          {(["All", ...MINDSET_CATEGORIES] as const).map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              {category === c ? (
                <Label style={styles.chipTextActive}>{c === "All" ? "All" : c}</Label>
              ) : (
                <Body size="sm" style={styles.chipText}>
                  {c === "All" ? "All" : c}
                </Body>
              )}
            </Pressable>
          ))}
        </View>

        {groups.map((group) => (
          <View key={group.category} style={styles.group}>
            <View style={styles.groupHeader}>
              <Kicker>
                Week {group.tracks[0].week} · {group.category}
              </Kicker>
              <Kicker>{group.tracks.length} days</Kicker>
            </View>
            <View style={styles.groupList}>
              {group.tracks.map((track) => {
                const playing = playingId === track.id;
                return (
                  <View key={track.id} style={styles.row}>
                    <Pressable
                      style={[
                        styles.playBtn,
                        !track.audioUrl && styles.playBtnDisabled,
                        playing && styles.playBtnPlaying,
                      ]}
                      disabled={!track.audioUrl}
                      onPress={() => togglePlay(track.id, track.audioUrl)}
                    >
                      {!track.audioUrl ? (
                        <Lock
                          size={iconSizes.sm}
                          color={colors.mutedForeground}
                          strokeWidth={2}
                        />
                      ) : playing ? (
                        <Pause
                          size={iconSizes.md}
                          color={colors.background}
                          strokeWidth={2}
                        />
                      ) : (
                        <View style={styles.playIcon}>
                          <Play size={iconSizes.md} color={colors.foreground} strokeWidth={2} />
                        </View>
                      )}
                    </Pressable>
                    <View style={styles.trackCopy}>
                      <View style={styles.trackTitleRow}>
                        <Kicker>Day {String(track.day).padStart(2, "0")}</Kicker>
                        <Label numberOfLines={1} style={styles.trackTitle}>
                          {track.title}
                        </Label>
                      </View>
                      <Body size="sm" style={styles.affirmation}>
                        &ldquo;{track.affirmation}&rdquo;
                      </Body>
                    </View>
                    <Kicker style={styles.duration}>{track.duration}</Kicker>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {!audioBase && (
          <Body style={styles.hint}>
            A track unlocks when its audio file is on the CDN (day-XX.mp3). It is not locked to the
            challenge calendar day.
            {__DEV__ ? " Set EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL in .env for local CDN." : ""}
          </Body>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    gap: space.md,
    alignItems: "flex-start",
    marginTop: space["2xl"],
    marginBottom: space.p6,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: {
    fontSize: typeScale.quote.fontSize,
    lineHeight: 30,
    letterSpacing: typeScale.quote.letterSpacing,
    marginTop: space.xs,
  },
  headerBody: { marginTop: 6 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius["2xl"],
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  chipText: { color: colors.foreground },
  chipTextActive: {
    color: colors.background,
    fontSize: typeScale.bodySm.fontSize,
    lineHeight: typeScale.bodySm.lineHeight,
    fontFamily: fonts.sansMedium,
    flexShrink: 1,
  },
  group: { marginTop: space.p5 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.md,
  },
  groupList: { gap: space.sm },
  row: {
    flexDirection: "row",
    gap: space.lg,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: space.p4,
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    alignItems: "center",
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  playBtnPlaying: { backgroundColor: colors.foreground },
  playBtnDisabled: { backgroundColor: colors.muted },
  playIcon: { transform: [{ translateX: 2 }] },
  trackCopy: { flex: 1, minWidth: 0 },
  trackTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: space.sm,
  },
  trackTitle: {
    flexShrink: 1,
    fontSize: typeScale.habitTitle.fontSize,
    lineHeight: typeScale.habitTitle.lineHeight,
    fontFamily: fonts.sansSemi,
  },
  affirmation: {
    fontStyle: "italic",
    lineHeight: 17,
    marginTop: space.xs,
  },
  duration: { flexShrink: 0 },
  hint: {
    textAlign: "center",
    marginTop: space.p6,
    fontSize: typeScale.meta.fontSize,
    lineHeight: typeScale.meta.lineHeight,
  },
});
