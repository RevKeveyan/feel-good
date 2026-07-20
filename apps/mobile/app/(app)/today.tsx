import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import {
  CHALLENGE_LENGTH,
  MOVE_TYPES,
  MINDSET_TYPES,
  completedDaysCount,
  computeStreak,
  currentDay,
  currentWeek,
  dailyScore,
  daysRemaining,
  formatDate,
  habitsComplete,
  isCheckInComplete,
  isDayComplete,
  missedYesterday,
  todayISO,
  type DailyEntry,
  type Profile,
  quoteForDate,
} from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { enqueueUpsert, flushOfflineQueue } from "@/lib/offline-queue";
import { signOut } from "@/lib/auth";
import { uploadLocalImage } from "@/lib/upload-image";
import { StruggleSheet } from "@/components/StruggleSheet";
import {
  Body,
  BrandCard,
  DisplayTitle,
  GradientCard,
  HabitToggle,
  Kicker,
  PillTab,
  PrimaryButton,
  ProgressBar,
  ScoreRing,
  Screen,
} from "@/components/ui";
import { colors, fonts, gradients, radius, space } from "@/src/theme";

const WATER_INCREMENT = 250;

export default function TodayScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showMindset, setShowMindset] = useState(false);
  const [showStruggle, setShowStruggle] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [tab, setTab] = useState("Today");
  const [initials, setInitials] = useState("FG");

  const today = todayISO();

  const load = useCallback(async () => {
    setLoading(true);
    await flushOfflineQueue();
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

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
      router.replace("/(app)/onboarding");
      return;
    }

    setProfile(profileRow);
    const name = profileRow?.display_name || auth.user?.email || "FG";
    setInitials(
      name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    );
    const rows = (entries ?? []) as DailyEntry[];
    setAllEntries(rows);
    setEntry(rows.find((r) => r.entry_date === today) ?? null);

    if (profileRow) {
      const week = currentWeek(profileRow.challenge_start_date);
      const { data: photo } = await supabase
        .from("weekly_photos")
        .select("*")
        .eq("user_id", uid)
        .eq("week_number", week)
        .maybeSingle();
      if (photo?.storage_path) {
        const { data: signed } = await supabase.storage
          .from("weekly-photos")
          .createSignedUrl(photo.storage_path, 3600);
        setPhotoUrl(signed?.signedUrl ?? null);
      } else {
        setPhotoUrl(null);
      }
    }
    setLoading(false);
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (tab === "Mindset") {
      router.push("/(app)/mindset");
      setTab("Today");
    }
  }, [tab]);

  async function upsertEntry(patch: Partial<DailyEntry>) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const uid = auth.user.id;
    const merged = {
      user_id: uid,
      entry_date: today,
      nourish: false,
      fuel: false,
      move_done: false,
      mindset: false,
      water_ml: 0,
      ...entry,
      ...patch,
    };

    const { data, error } = await supabase
      .from("daily_entries")
      .upsert(merged, { onConflict: "user_id,entry_date" })
      .select()
      .single();

    if (error) {
      await enqueueUpsert(merged);
      setEntry(merged as DailyEntry);
      Alert.alert("Saved offline", "Will sync when you're back online.");
      return;
    }

    void Haptics.selectionAsync();
    const updated = data as DailyEntry;
    setEntry(updated);
    setAllEntries((prev) => [updated, ...prev.filter((r) => r.entry_date !== updated.entry_date)]);
  }

  async function uploadWeeklyPhoto() {
    if (!profile || uploadingPhoto) return;

    Alert.alert("Weekly progress photo", "Choose a source", [
      { text: "Cancel", style: "cancel" },
      { text: "Take photo", onPress: () => void pickAndUploadWeekly("camera") },
      { text: "Choose from library", onPress: () => void pickAndUploadWeekly("library") },
    ]);
  }

  async function pickAndUploadWeekly(source: "camera" | "library") {
    if (!profile || uploadingPhoto) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Camera access is required for weekly photos.");
        return;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Photo library access is required for weekly photos.");
        return;
      }
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const weekNum = currentWeek(profile.challenge_start_date);
      const path = `${auth.user.id}/week-${weekNum}-${Date.now()}.jpg`;
      await uploadLocalImage({
        bucket: "weekly-photos",
        path,
        uri: result.assets[0].uri,
        contentType: "image/jpeg",
        upsert: true,
      });

      await supabase.from("weekly_photos").upsert(
        { user_id: auth.user.id, week_number: weekNum, storage_path: path },
        { onConflict: "user_id,week_number" },
      );

      const { data: signed } = await supabase.storage.from("weekly-photos").createSignedUrl(path, 3600);
      setPhotoUrl(signed?.signedUrl ?? null);
      Alert.alert("Saved", `Week ${weekNum} photo uploaded.`);
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  const target = profile?.water_target_ml ?? 2500;
  const score = dailyScore(entry, target);
  const habits = habitsComplete(entry, target);
  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const week = profile ? currentWeek(profile.challenge_start_date) : 1;
  const remaining = profile ? daysRemaining(profile.challenge_start_date) : CHALLENGE_LENGTH;
  const waterLiters = (entry?.water_ml ?? 0) / 1000;
  const waterProgress = Math.min(100, ((entry?.water_ml ?? 0) / target) * 100);
  const streak = useMemo(() => computeStreak(allEntries), [allEntries]);
  const journeyPct = useMemo(
    () => Math.round((completedDaysCount(allEntries) / CHALLENGE_LENGTH) * 100),
    [allEntries],
  );
  const missedYest = useMemo(
    () => (profile ? missedYesterday(allEntries, profile.challenge_start_date) : false),
    [allEntries, profile],
  );
  const quote = quoteForDate(today);
  const checkInDone = isCheckInComplete(entry);

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
    <>
      <Screen edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Kicker>{formatDate(today)}</Kicker>
              <DisplayTitle style={styles.dayTitle}>
                Day {day} <Text style={styles.dayMuted}>of {CHALLENGE_LENGTH}</Text>
              </DisplayTitle>
            </View>
            <Pressable style={styles.avatar} onPress={handleSignOut} onLongPress={() => router.push("/(app)/settings")}>
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>

          {day >= CHALLENGE_LENGTH && (
            <Pressable style={styles.revealCta} onPress={() => router.push("/(app)/complete")}>
              <Kicker style={{ color: colors.primaryForeground }}>Day 55</Kicker>
              <Text style={styles.revealTitle}>Reveal your transformation</Text>
            </Pressable>
          )}

          {missedYest && (
            <BrandCard style={styles.banner}>
              <Text style={styles.bannerTitle}>You missed yesterday.</Text>
              <Body>Your streak is paused. Complete today to continue.</Body>
            </BrandCard>
          )}

          <GradientCard colorsStops={gradients.quote} orb style={{ marginBottom: space.lg }}>
            <Kicker>Today&apos;s reminder</Kicker>
            <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
          </GradientCard>

          <PillTab tabs={["Today", "Mindset"]} active={tab} onChange={setTab} />

          <View style={styles.statsRow}>
            <GradientCard colorsStops={gradients.streak} style={styles.statCard}>
              <Kicker>Streak</Kicker>
              <Text style={styles.statValue}>{streak}</Text>
            </GradientCard>
            <GradientCard colorsStops={gradients.journey} style={styles.statCard}>
              <Kicker>Journey</Kicker>
              <Text style={styles.statValue}>{journeyPct}%</Text>
              <ProgressBar progress={journeyPct} />
            </GradientCard>
          </View>

          <GradientCard colorsStops={gradients.score} style={{ marginBottom: space.xl }}>
            <ScoreRing
              score={score}
              habits={habits}
              checkInDone={checkInDone}
              remaining={remaining}
            />
          </GradientCard>

          <DisplayTitle style={styles.sectionTitle}>The Feel Good Five</DisplayTitle>
          <Body style={{ marginBottom: space.md }}>{habits} of 5 done</Body>

          <HabitToggle
            title="Nourish"
            done={!!entry?.nourish}
            onPress={() => upsertEntry({ nourish: !entry?.nourish })}
          />
          <HabitToggle
            title="Fuel"
            done={!!entry?.fuel}
            onPress={() => upsertEntry({ fuel: !entry?.fuel })}
          />
          <HabitToggle
            title="Move"
            done={!!entry?.move_done}
            subtitle={
              entry?.move_done && entry.move_type
                ? `${entry.move_type} · ${entry.move_minutes ?? 0}m`
                : "Log movement"
            }
            onPress={() => setShowMove(true)}
          />
          <HabitToggle
            title="Mindset"
            done={!!entry?.mindset}
            subtitle={entry?.mindset_type ?? "Log mindset practice"}
            onPress={() => setShowMindset(true)}
          />

          <BrandCard style={{ marginBottom: space.sm, padding: 16 }}>
            <View style={styles.hydrateRow}>
              <View style={styles.hydrateDot}>
                <View style={styles.hydrateDotInner} />
              </View>
              <View style={styles.hydrateCopy}>
                <Text style={styles.habitTitle}>Hydrate</Text>
                <Text style={styles.habitSub}>
                  {waterLiters}L of {target / 1000}L
                </Text>
              </View>
              <View style={styles.waterRow}>
                <Pressable
                  style={styles.waterBtn}
                  onPress={() => upsertEntry({ water_ml: Math.max(0, (entry?.water_ml ?? 0) - WATER_INCREMENT) })}
                >
                  <Text style={styles.waterBtnText}>−</Text>
                </Pressable>
                <Pressable
                  style={[styles.waterBtn, styles.waterBtnPrimary]}
                  onPress={() => upsertEntry({ water_ml: (entry?.water_ml ?? 0) + WATER_INCREMENT })}
                >
                  <Text style={[styles.waterBtnText, { color: colors.primaryForeground }]}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.hydrateTrack}>
              <View style={[styles.hydrateFill, { width: `${waterProgress}%` }]} />
            </View>
          </BrandCard>

          <Pressable
            style={[styles.checkInCard, checkInDone && styles.checkInDone]}
            onPress={() => setShowCheckIn(true)}
          >
            <View style={styles.checkInKickerRow}>
              <Text
                style={[
                  styles.checkInLock,
                  checkInDone && { color: colors.foreground },
                ]}
              >
                {checkInDone ? "✓" : "🔒"}
              </Text>
              <Kicker
                style={{
                  color: checkInDone ? colors.mutedForeground : "rgba(248,239,238,0.8)",
                }}
              >
                {checkInDone ? "Daily check-in complete" : "Required to complete today"}
              </Kicker>
            </View>
            <Text style={[styles.checkInTitle, checkInDone && { color: colors.foreground }]}>
              {checkInDone ? "Update today's reflection" : "How are you today?"}
            </Text>
            <Text style={[styles.checkInSub, checkInDone && { color: colors.mutedForeground }]}>
              Energy, mood, stress, motivation, the daily check-in is what marks Day {day} as
              complete and keeps your streak alive.
            </Text>
            <View style={styles.checkInOrb} />
          </Pressable>

          <BrandCard style={{ marginBottom: space.sm }}>
            <View style={styles.photoHeader}>
              <View style={{ flex: 1 }}>
                <Kicker>Week {week} of 8</Kicker>
                <DisplayTitle style={{ fontSize: 22, marginTop: 4 }}>
                  Weekly progress photo
                </DisplayTitle>
              </View>
              <Text style={styles.cameraGlyph}>📷</Text>
            </View>
            {photoUrl ? (
              <View style={styles.photoMediaWrap}>
                <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
                <View style={styles.photoBadge}>
                  <Text style={styles.photoBadgeText}>Week {week}</Text>
                </View>
              </View>
            ) : (
              <Pressable style={styles.photoBox} onPress={uploadWeeklyPhoto}>
                <Text style={styles.cameraGlyphLarge}>📷</Text>
                <Text style={styles.photoHint}>Add your Week {week} photo</Text>
                <Text style={styles.photoSub}>
                  Same pose, same light. Future you will thank you.
                </Text>
              </Pressable>
            )}
            <PrimaryButton
              label={uploadingPhoto ? "Uploading…" : photoUrl ? "Replace photo" : "Upload photo"}
              onPress={uploadWeeklyPhoto}
              disabled={uploadingPhoto}
              loading={uploadingPhoto}
              style={{ marginTop: 16 }}
            />
          </BrandCard>

          <Pressable style={styles.linkRow} onPress={() => router.push("/(app)/settings")}>
            <Text style={styles.linkText}>Settings</Text>
          </Pressable>

          {isDayComplete(entry) && <Text style={styles.completeBadge}>Day complete</Text>}
        </ScrollView>
      </Screen>

      <Pressable style={styles.struggleBtn} onPress={() => setShowStruggle(true)}>
        <Text style={styles.struggleBtnText}>I&apos;m struggling</Text>
      </Pressable>

      <StruggleSheet visible={showStruggle} onClose={() => setShowStruggle(false)} />

      <PickerModal
        visible={showMove}
        title="Log movement"
        options={MOVE_TYPES}
        onPick={(type) =>
          upsertEntry({ move_type: type, move_minutes: 30, move_done: true }).then(() => setShowMove(false))
        }
        onClose={() => setShowMove(false)}
      />
      <PickerModal
        visible={showMindset}
        title="Log mindset"
        options={MINDSET_TYPES}
        onPick={(type) =>
          upsertEntry({ mindset_type: type, mindset: true }).then(() => setShowMindset(false))
        }
        onClose={() => setShowMindset(false)}
      />

      <CheckInModal
        visible={showCheckIn}
        entry={entry}
        onClose={() => setShowCheckIn(false)}
        onSave={(patch) => upsertEntry(patch).then(() => setShowCheckIn(false))}
      />
    </>
  );
}

function PickerModal({
  visible,
  title,
  options,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly string[];
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <DisplayTitle style={{ fontSize: 22, marginBottom: 16 }}>{title}</DisplayTitle>
          {options.map((o) => (
            <Pressable key={o} style={styles.modalOption} onPress={() => onPick(o)}>
              <Text style={styles.modalOptionText}>{o}</Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function CheckInModal({
  visible,
  entry,
  onClose,
  onSave,
}: {
  visible: boolean;
  entry: DailyEntry | null;
  onClose: () => void;
  onSave: (patch: Partial<DailyEntry>) => Promise<void>;
}) {
  const [energy, setEnergy] = useState<number | null>(entry?.energy ?? null);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [stress, setStress] = useState<number | null>(entry?.stress ?? null);
  const [motivation, setMotivation] = useState<number | null>(entry?.motivation ?? null);
  const [notes, setNotes] = useState(entry?.notes ?? "");

  useEffect(() => {
    setEnergy(entry?.energy ?? null);
    setMood(entry?.mood ?? null);
    setStress(entry?.stress ?? null);
    setMotivation(entry?.motivation ?? null);
    setNotes(entry?.notes ?? "");
  }, [entry, visible]);

  const ready = energy != null && mood != null && stress != null && motivation != null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalCard}>
          <DisplayTitle style={{ fontSize: 22, marginBottom: 16 }}>Daily check-in</DisplayTitle>
          <Scale label="Energy" value={energy} onChange={setEnergy} />
          <Scale label="Mood" value={mood} onChange={setMood} />
          <Scale label="Stress" value={stress} onChange={setStress} />
          <Scale label="Motivation" value={motivation} onChange={setMotivation} />
          <TextInput
            style={styles.notesInput}
            placeholder="Reflection (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <PrimaryButton
            label="Save check-in"
            disabled={!ready}
            onPress={() =>
              onSave({
                energy,
                mood,
                stress,
                motivation,
                notes: notes || null,
              })
            }
          />
          <Pressable onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.scaleLabel}>
        {label} {value ?? "-"}/10
      </Text>
      <View style={styles.scaleRow}>
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          return (
            <Pressable
              key={n}
              style={[styles.scaleDot, value != null && n <= value && styles.scaleDotActive]}
              onPress={() => onChange(n)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 120, paddingTop: space.lg },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: space.lg },
  dayTitle: { fontSize: 28, marginTop: 4 },
  dayMuted: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontStyle: "normal",
    color: colors.mutedForeground,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.sansSemi,
    color: colors.primaryForeground,
    fontSize: 13,
  },
  revealCta: {
    backgroundColor: colors.primary,
    borderRadius: radius["3xl"],
    padding: 20,
    marginBottom: space.md,
  },
  revealTitle: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 20,
    color: colors.primaryForeground,
    marginTop: 4,
  },
  banner: { marginBottom: space.md },
  bannerTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    marginBottom: 4,
  },
  quoteText: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 18,
    color: colors.foreground,
    marginTop: 8,
    lineHeight: 26,
  },
  statsRow: { flexDirection: "row", gap: 10, marginVertical: space.lg },
  statCard: { flex: 1, padding: 16 },
  statValue: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 28,
    color: colors.foreground,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 22, marginBottom: 4 },
  habitTitle: { fontFamily: fonts.sansSemi, color: colors.foreground, fontSize: 14 },
  habitSub: { fontFamily: fonts.sans, color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
  hydrateRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  hydrateDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(34,34,34,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  hydrateDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(34,34,34,0.2)",
  },
  hydrateCopy: { flex: 1 },
  waterRow: { flexDirection: "row", gap: 8 },
  waterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  waterBtnPrimary: { backgroundColor: colors.primary },
  waterBtnText: { fontSize: 16, color: colors.foreground, fontFamily: fonts.sansSemi },
  hydrateTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(34,34,34,0.1)",
    overflow: "hidden",
  },
  hydrateFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  checkInCard: {
    backgroundColor: colors.primary,
    borderRadius: radius["3xl"],
    padding: 24,
    marginVertical: space.md,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: "hidden",
    position: "relative",
  },
  checkInDone: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  checkInKickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  checkInLock: { fontSize: 12, color: "rgba(248,239,238,0.8)" },
  checkInTitle: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 24,
    color: colors.primaryForeground,
    marginTop: 4,
    marginBottom: 8,
  },
  checkInSub: {
    fontFamily: fonts.sans,
    color: "rgba(248,239,238,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  checkInOrb: {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primaryForeground,
    opacity: 0.1,
  },
  photoHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  cameraGlyph: { fontSize: 20, marginTop: 4 },
  cameraGlyphLarge: { fontSize: 32, marginBottom: 8, opacity: 0.6 },
  photoMediaWrap: {
    width: "100%",
    alignSelf: "stretch",
    position: "relative",
  },
  photoBox: {
    width: "100%",
    alignSelf: "stretch",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(34,34,34,0.3)",
    borderRadius: radius["2xl"],
    aspectRatio: 4 / 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  photoPreview: {
    width: "100%",
    alignSelf: "stretch",
    aspectRatio: 4 / 5,
    borderRadius: radius["2xl"],
    backgroundColor: colors.muted,
  },
  photoBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  photoBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.white,
  },
  photoHint: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    fontSize: 14,
    textAlign: "center",
  },
  photoSub: {
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 220,
  },
  linkRow: { paddingVertical: 16, alignItems: "center" },
  linkText: { fontFamily: fonts.heading, letterSpacing: 2, textTransform: "uppercase", fontSize: 11, color: colors.mutedForeground },
  completeBadge: {
    textAlign: "center",
    marginTop: 8,
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
  },
  struggleBtn: {
    position: "absolute",
    bottom: 28,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  struggleBtnText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.foreground },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    padding: 24,
    maxHeight: "85%",
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: { fontFamily: fonts.sans, color: colors.foreground },
  modalCancel: {
    textAlign: "center",
    marginTop: 16,
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
  },
  scaleLabel: { fontFamily: fonts.sansSemi, marginBottom: 6, color: colors.foreground },
  scaleRow: { flexDirection: "row", gap: 4 },
  scaleDot: { flex: 1, height: 28, borderRadius: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  scaleDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 12,
    minHeight: 80,
    marginBottom: 12,
    fontFamily: fonts.sans,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
