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
import { colors, radius, space } from "@/src/theme";

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

  const tracks = useMemo(() => {
    const withAudio = MINDSET_TRACKS.map((t) => ({
      ...t,
      audioUrl: getMindsetAudioUrl(t.day, audioBase),
    }));
    if (category === "All") return withAudio;
    return withAudio.filter((t) => t.category === category);
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
            icon={<ArrowLeft size={14} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>Back to today</Kicker>
          </IconLabel>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconTile}>
            <Headphones size={20} color={colors.foreground} strokeWidth={2} />
          </View>
          <View style={styles.headerCopy}>
            <Kicker>21-Day Mindset Rewire</Kicker>
            <DisplayTitle size="sm" style={{ fontSize: 28, marginTop: 4 }}>
              One Session. One Moment.
            </DisplayTitle>
            <Body style={{ marginTop: 6 }}>
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

        {tracks.map((track) => {
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
                  <Lock size={16} color={colors.mutedForeground} strokeWidth={2} />
                ) : playing ? (
                  <Pause size={18} color={colors.primaryForeground} strokeWidth={2} />
                ) : (
                  <View style={{ transform: [{ translateX: 2 }] }}>
                    <Play size={18} color={colors.foreground} strokeWidth={2} />
                  </View>
                )}
              </Pressable>
              <View style={styles.trackCopy}>
                <Label style={styles.trackTitle}>
                  Day {track.day} · {track.title}
                </Label>
                <Body size="sm" style={styles.meta}>
                  {track.duration} · {track.category}
                </Body>
                <DisplayTitle size="sm" style={styles.affirmation}>
                  &ldquo;{track.affirmation}&rdquo;
                </DisplayTitle>
              </View>
            </View>
          );
        })}

        {!audioBase && (
          <Body style={styles.hint}>
            Audio for each day will unlock as it is added.
            {__DEV__ ? " Set EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL in .env for local CDN." : ""}
          </Body>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, paddingBottom: 40 },
  header: { flexDirection: "row", gap: 14, alignItems: "flex-start", marginTop: space.lg, marginBottom: space.lg },
  headerCopy: { flex: 1, minWidth: 0 },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: space.lg },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.foreground },
  chipTextActive: { color: colors.primaryForeground, fontSize: 12, flexShrink: 1 },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.ringHairline,
    alignItems: "center",
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnPlaying: { backgroundColor: colors.primary },
  playBtnDisabled: { backgroundColor: colors.muted },
  trackCopy: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 14 },
  meta: {
    marginTop: 2,
    flexShrink: 1,
  },
  affirmation: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    flexShrink: 1,
  },
  hint: { textAlign: "center", marginTop: 16 },
});
