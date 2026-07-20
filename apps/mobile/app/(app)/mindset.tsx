import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Audio } from "expo-av";
import {
  MINDSET_CATEGORIES,
  MINDSET_TRACKS,
  getMindsetAudioUrl,
  type MindsetCategory,
} from "@feelgood/shared";
import { Body, DisplayTitle, Kicker, Screen } from "@/components/ui";
import { colors, fonts, radius, space } from "@/src/theme";

const audioBase = process.env.EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL ?? null;

export default function MindsetScreen() {
  const [category, setCategory] = useState<MindsetCategory | "All">("All");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const tracks = useMemo(() => {
    const withAudio = MINDSET_TRACKS.map((t) => ({
      ...t,
      audioUrl: getMindsetAudioUrl(t.day, audioBase),
    }));
    if (category === "All") return withAudio;
    return withAudio.filter((t) => t.category === category);
  }, [category]);

  async function togglePlay(trackId: number, url: string | null) {
    if (!url) return;
    if (playingId === trackId) {
      await soundRef.current?.stopAsync();
      setPlayingId(null);
      return;
    }
    await soundRef.current?.unloadAsync();
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    soundRef.current = sound;
    setPlayingId(trackId);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) setPlayingId(null);
    });
    await sound.playAsync();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Kicker>← Today</Kicker>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconTile}>
            <Text style={styles.iconGlyph}>◎</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Kicker>21-Day Mindset Rewire</Kicker>
            <DisplayTitle style={{ fontSize: 28, marginTop: 4 }}>Mindset library</DisplayTitle>
          </View>
        </View>

        <View style={styles.chips}>
          {(["All", ...MINDSET_CATEGORIES] as const).map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c === "All" ? "All" : c.split(",")[0]}
              </Text>
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
                onPress={() => void togglePlay(track.id, track.audioUrl)}
              >
                <Text style={styles.playGlyph}>
                  {playing ? "❚❚" : track.audioUrl ? "▶" : "🔒"}
                </Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>
                  Day {track.day} · {track.title}
                </Text>
                <Text style={styles.affirmation}>&ldquo;{track.affirmation}&rdquo;</Text>
              </View>
            </View>
          );
        })}

        {!audioBase && (
          <Body style={styles.hint}>Set EXPO_PUBLIC_MINDSET_AUDIO_BASE_URL to unlock audio.</Body>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, paddingBottom: 40 },
  header: { flexDirection: "row", gap: 14, alignItems: "center", marginTop: space.lg, marginBottom: space.lg },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: { fontSize: 20, color: colors.foreground },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: space.lg },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.foreground },
  chipTextActive: { color: colors.primaryForeground, fontFamily: fonts.sansSemi },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  playBtnDisabled: { backgroundColor: colors.border },
  playGlyph: { fontSize: 12, color: colors.foreground },
  trackTitle: { fontFamily: fonts.sansSemi, color: colors.foreground },
  affirmation: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },
  hint: { textAlign: "center", marginTop: 16 },
});
