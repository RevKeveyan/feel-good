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
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Camera, CheckCircle2, Flame, Heart, Lock } from "@/components/ui/icons";
import { KeyboardAccessoryBar } from "@/components/KeyboardScreen";
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
import { resolveAvatarUrl } from "@/lib/avatar";
import { alertMediaPermissionNeeded } from "@/lib/media-permissions";
import { enqueueUpsert, flushOfflineQueue } from "@/lib/offline-queue";
import { cacheBustUrl, formatUploadError, uploadLocalImage } from "@/lib/upload-image";
import { StruggleSheet } from "@/components/StruggleSheet";
import {
  Body,
  BrandCard,
  DisplayTitle,
  GradientCard,
  HabitToggle,
  HydrateCard,
  IconLabel,
  Kicker,
  Label,
  PillTab,
  PrimaryButton,
  ProgressBar,
  ScoreRing,
  Screen,
  SoftOrb,
  StatValue,
} from "@/components/ui";
import {
  borders,
  colors,
  fonts,
  gradients,
  iconSizes,
  opacity,
  radius,
  space,
  typeScale,
  withAlpha,
} from "@/src/theme";

const HYDRATE_POINTS = 36;

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
  const [photoStoragePath, setPhotoStoragePath] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [moveMinutes, setMoveMinutes] = useState("30");
  const [tab, setTab] = useState("Today");
  const [initials, setInitials] = useState("FG");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const today = todayISO();

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
    const name = profileRow?.display_name || auth.user?.email || "FG";
    setInitials(
      name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    );

    setAvatarUrl(
      await resolveAvatarUrl({ avatarPath: profileRow?.avatar_path, user: auth.user }),
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
        setPhotoStoragePath(photo.storage_path);
        const { data: signed } = await supabase.storage
          .from("weekly-photos")
          .createSignedUrl(photo.storage_path, 3600);
        setPhotoUrl(cacheBustUrl(signed?.signedUrl) ?? null);
      } else {
        setPhotoStoragePath(null);
        setPhotoUrl(null);
      }
    }
    setLoading(false);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
        alertMediaPermissionNeeded("Camera access is required for weekly photos.");
        return;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alertMediaPermissionNeeded("Photo library access is required for weekly photos.");
        return;
      }
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: true,
            mediaTypes: ["images"],
          });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const weekNum = currentWeek(profile.challenge_start_date);
      const asset = result.assets[0];
      const path = `${auth.user.id}/week-${weekNum}-${Date.now()}.jpg`;
      await uploadLocalImage({
        bucket: "weekly-photos",
        path,
        uri: asset.uri,
        contentType: "image/jpeg",
        upsert: true,
      });

      if (photoStoragePath && photoStoragePath !== path) {
        await supabase.storage.from("weekly-photos").remove([photoStoragePath]);
      }

      const { error } = await supabase.from("weekly_photos").upsert(
        { user_id: auth.user.id, week_number: weekNum, storage_path: path },
        { onConflict: "user_id,week_number" },
      );
      if (error) throw new Error(error.message || "Could not save weekly photo");

      setPhotoStoragePath(path);
      const { data: signed } = await supabase.storage.from("weekly-photos").createSignedUrl(path, 3600);
      setPhotoUrl(cacheBustUrl(signed?.signedUrl) ?? null);
      Alert.alert("Saved", `Week ${weekNum} photo saved`);
    } catch (e) {
      Alert.alert("Upload failed", formatUploadError(e));
    } finally {
      setUploadingPhoto(false);
    }
  }

  const target = profile?.water_target_ml ?? 2500;
  const score = dailyScore(entry, target);
  const habits = habitsComplete(entry, target);
  const day = profile ? currentDay(profile.challenge_start_date) : 1;
  const week = profile ? currentWeek(profile.challenge_start_date) : 1;
  const remaining = profile ? daysRemaining(profile.challenge_start_date) : CHALLENGE_LENGTH;
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
            <View style={styles.headerCopy}>
              <Pressable onPress={() => router.push("/(app)/overview")}>
                <Kicker>All days</Kicker>
              </Pressable>
              <Kicker style={styles.headerDate}>{formatDate(today)}</Kicker>
              <View style={styles.dayRow}>
                <DisplayTitle style={styles.dayTitle}>Day {day}</DisplayTitle>
                <Body size="sm" style={styles.dayMuted}>
                  of {CHALLENGE_LENGTH}
                </Body>
              </View>
            </View>
            <Pressable style={styles.avatar} onPress={() => router.push("/(app)/settings")}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </Pressable>
          </View>

          {day >= CHALLENGE_LENGTH && (
            <Pressable onPress={() => router.push("/(app)/complete")}>
              <LinearGradient
                colors={[...gradients.day55Banner]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.revealCta}
              >
                <View style={styles.revealCopy}>
                  <Kicker style={styles.revealKicker}>Day 55 · Unlocked</Kicker>
                  <DisplayTitle size="sm" style={styles.revealTitle}>
                    Reveal your transformation
                  </DisplayTitle>
                </View>
                <Text style={styles.revealArrow}>→</Text>
              </LinearGradient>
            </Pressable>
          )}

          {missedYest && (
            <BrandCard style={styles.banner}>
              <IconLabel
                icon={<Heart size={iconSizes.md} color={colors.accent} strokeWidth={2} />}
                style={styles.bannerRow}
                gap={space.md}
              >
                <View style={styles.bannerCopy}>
                  <Label style={styles.bannerTitle}>You missed yesterday.</Label>
                  <Body size="sm">
                    Your streak is paused, not lost. Complete today&apos;s challenge to continue
                    your transformation.
                  </Body>
                </View>
              </IconLabel>
            </BrandCard>
          )}

          <GradientCard
            colorsStops={gradients.quote}
            style={styles.quoteCard}
            orb={
              <SoftOrb
                size={160}
                blur={64}
                color={colors.accent}
                opacity={0.4}
                top={-40}
                right={-40}
              />
            }
          >
            <Kicker style={styles.quoteKicker}>Today&apos;s reminder</Kicker>
            <DisplayTitle size="sm" style={styles.quoteText}>
              &ldquo;{quote.text}&rdquo;
            </DisplayTitle>
            {quote.author ? (
              <Body size="sm" style={styles.quoteAuthor}>
                - {quote.author}
              </Body>
            ) : null}
          </GradientCard>

          <PillTab tabs={["Today", "Mindset"]} active={tab} onChange={setTab} />

          <View style={styles.statsRow}>
            <GradientCard
              colorsStops={gradients.streak}
              style={[styles.statCard, styles.statCardStreak]}
            >
              <IconLabel
                icon={<Flame size={iconSizes.sm} color={colors.destructive} strokeWidth={2} />}
                gap={space.sm}
              >
                <Kicker style={styles.statKicker}>Streak</Kicker>
              </IconLabel>
              <View style={styles.statValueRow}>
                <StatValue size="lg" style={styles.statValue}>
                  {streak}
                </StatValue>
                <Body size="sm" style={styles.statUnit}>
                  {streak === 1 ? "day" : "days"}
                </Body>
              </View>
              <Text style={styles.statCaption}>
                {streak === 0 ? "Complete today to start" : "Keep it going"}
              </Text>
            </GradientCard>
            <Pressable style={styles.statPressable} onPress={() => router.push("/(app)/overview")}>
              <GradientCard
                colorsStops={gradients.journey}
                style={[styles.statCard, styles.statCardJourney]}
              >
                <Kicker style={styles.statKicker}>Journey</Kicker>
                <View style={styles.statValueRow}>
                  <StatValue size="lg" style={styles.statValue}>
                    {journeyPct}
                  </StatValue>
                  <Body size="sm" style={styles.statUnit}>
                    %
                  </Body>
                </View>
                <ProgressBar progress={journeyPct} />
                <Text style={styles.statCaption}>
                  {completedDaysCount(allEntries)} of {CHALLENGE_LENGTH} days complete
                </Text>
              </GradientCard>
            </Pressable>
          </View>

          <GradientCard
            colorsStops={gradients.score}
            style={styles.scoreCard}
            contentStyle={styles.scoreContent}
            orb={
              <SoftOrb
                size={192}
                blur={64}
                color={colors.accent}
                opacity={0.25}
                bottom={-64}
                left={-64}
              />
            }
          >
            <DisplayTitle size="xl" style={styles.scoreWatermark}>
              55
            </DisplayTitle>
            <ScoreRing
              score={score}
              habits={habits}
              checkInDone={checkInDone}
              remaining={remaining}
            />
          </GradientCard>

          <View style={styles.sectionHeader}>
            <DisplayTitle size="sm" style={styles.sectionTitle}>The Feel Good Five</DisplayTitle>
            <Kicker style={styles.sectionCount}>{habits} of 5 done</Kicker>
          </View>

          <View style={styles.habitStack}>
          <HabitToggle
            title="Nourish"
            done={!!entry?.nourish}
            subtitle={entry?.nourish ? "Personalised plan followed" : "Follow your nutrition plan"}
            onPress={() => upsertEntry({ nourish: !entry?.nourish })}
            points={16}
          />
          <HabitToggle
            title="Fuel"
            done={!!entry?.fuel}
            subtitle={entry?.fuel ? "Pods & powders taken" : "Take your pods & powders"}
            onPress={() => upsertEntry({ fuel: !entry?.fuel })}
            points={16}
          />
          <HabitToggle
            title="Move"
            done={!!entry?.move_done}
            subtitle={
              entry?.move_done && entry.move_type
                ? `${entry.move_type} · ${entry.move_minutes ?? 0}m`
                : "Move for 30 mins + 5,000 steps"
            }
            onPress={() => {
              setMoveMinutes(String(entry?.move_minutes ?? 30));
              setShowMove(true);
            }}
            points={16}
          />
          <HabitToggle
            title="Mindset"
            done={!!entry?.mindset}
            subtitle={entry?.mindset_type ?? "5-10 mins of mindset practice"}
            onPress={() => setShowMindset(true)}
            points={16}
          />

          <HydrateCard
            waterMl={entry?.water_ml ?? 0}
            targetMl={target}
            points={HYDRATE_POINTS}
            onChange={(ml) => void upsertEntry({ water_ml: ml })}
          />
          </View>

          <Pressable
            style={[styles.checkInCard, checkInDone && styles.checkInDone]}
            onPress={() => setShowCheckIn(true)}
          >
            <View style={styles.checkInKickerRow}>
              {checkInDone ? (
                <CheckCircle2 size={iconSizes.xs} color={colors.primary} strokeWidth={2} />
              ) : (
                <Lock
                  size={iconSizes.xs}
                  color={withAlpha(colors.primaryForeground, 0.8)}
                  strokeWidth={2}
                />
              )}
              <Kicker
                style={
                  checkInDone ? styles.checkInKickerDone : styles.checkInKickerOpen
                }
              >
                {checkInDone ? "Daily check-in complete" : "Required to complete today"}
              </Kicker>
            </View>
            <DisplayTitle
              size="sm"
              inverted={!checkInDone}
              style={[styles.checkInTitle, checkInDone && { color: colors.foreground }]}
            >
              {checkInDone ? "Update today's reflection" : "How are you today?"}
            </DisplayTitle>
            <Body
              inverted={!checkInDone}
              style={[styles.checkInSub, checkInDone && styles.checkInSubDone]}
            >
              Energy, mood, stress, motivation, the daily check-in is what marks Day {day} as
              complete and keeps your streak alive.
            </Body>
            <View style={[styles.checkInOrb, checkInDone && styles.checkInOrbDone]} />
          </Pressable>

          <BrandCard style={styles.photoCard}>
            <View style={styles.photoHeader}>
              <View style={styles.photoHeaderCopy}>
                <Kicker>Week {week} of 8</Kicker>
                <DisplayTitle size="sm" style={styles.photoTitle}>
                  Weekly progress photo
                </DisplayTitle>
              </View>
              <Camera size={iconSizes.md} color={colors.primary} strokeWidth={2} />
            </View>
            {photoUrl ? (
              <View style={styles.photoMediaWrap}>
                <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
                <View style={styles.photoBadge}>
                  <Kicker style={styles.photoBadgeText}>Week {week}</Kicker>
                </View>
              </View>
            ) : (
              <Pressable style={styles.photoBox} onPress={uploadWeeklyPhoto}>
                <Camera
                  size={iconSizes.xl}
                  color={withAlpha(colors.primary, 0.6)}
                  strokeWidth={2}
                  style={styles.photoBoxIcon}
                />
                <Label style={styles.photoHint}>Add your Week {week} photo</Label>
                <Body size="sm" style={styles.photoSub}>
                  Same pose, same light. Future you will thank you.
                </Body>
              </Pressable>
            )}
            <PrimaryButton
              label={uploadingPhoto ? "Uploading…" : photoUrl ? "Replace photo" : "Upload photo"}
              onPress={uploadWeeklyPhoto}
              disabled={uploadingPhoto}
              loading={uploadingPhoto}
              style={[styles.photoCta, uploadingPhoto && { opacity: opacity.disabledSoft }]}
            />
          </BrandCard>

          <Pressable style={styles.linkRow} onPress={() => router.push("/(app)/settings")}>
            <Kicker style={styles.linkText}>Settings</Kicker>
          </Pressable>

          {isDayComplete(entry) && <Label style={styles.completeBadge}>Day complete</Label>}
        </ScrollView>
      </Screen>

      <Pressable style={styles.struggleBtn} onPress={() => setShowStruggle(true)}>
        <Label style={styles.struggleBtnText}>I&apos;m struggling</Label>
      </Pressable>

      <StruggleSheet visible={showStruggle} onClose={() => setShowStruggle(false)} />

      <MoveModal
        visible={showMove}
        initialType={entry?.move_type ?? MOVE_TYPES[0]}
        minutes={moveMinutes}
        onMinutesChange={setMoveMinutes}
        options={MOVE_TYPES}
        onSave={(type) => {
          const mins = Math.max(1, parseInt(moveMinutes, 10) || 30);
          return upsertEntry({ move_type: type, move_minutes: mins, move_done: true }).then(() =>
            setShowMove(false),
          );
        }}
        onClose={() => setShowMove(false)}
      />
      <PickerModal
        visible={showMindset}
        title="Log mindset"
        options={MINDSET_TYPES}
        onPick={(type) =>
          upsertEntry({ mindset_type: type, mindset: true }).then(() => setShowMindset(false))
        }
        onClear={() =>
          upsertEntry({ mindset: false, mindset_type: null }).then(() => setShowMindset(false))
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

function MoveModal({
  visible,
  initialType,
  minutes,
  onMinutesChange,
  options,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialType: string;
  minutes: string;
  onMinutesChange: (v: string) => void;
  options: readonly string[];
  onSave: (type: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedType(initialType);
      setSaving(false);
    }
  }, [visible, initialType]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(selectedType);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <ScrollView
          style={styles.modalSheet}
          contentContainerStyle={styles.modalCardInner}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.moveHeader}>
            <DisplayTitle size="sm" style={styles.moveTitle}>
              Log movement
            </DisplayTitle>
            <Pressable onPress={onClose} style={styles.moveClose} hitSlop={8}>
              <Text style={styles.moveCloseText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.moveGrid}>
            {options.map((o) => {
              const selected = o === selectedType;
              return (
                <Pressable
                  key={o}
                  onPress={() => setSelectedType(o)}
                  style={[styles.movePill, selected && styles.movePillSelected]}
                >
                  <Text style={[styles.movePillText, selected && styles.movePillTextSelected]}>
                    {o}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Kicker style={styles.moveDurationLabel}>Duration (minutes)</Kicker>
          <TextInput
            style={styles.moveMinutesInput}
            keyboardType="number-pad"
            value={minutes}
            onChangeText={onMinutesChange}
            placeholder="30"
            placeholderTextColor={colors.mutedForeground}
          />

          <PrimaryButton
            label="Save"
            onPress={handleSave}
            loading={saving}
            style={styles.moveSave}
          />
        </ScrollView>
        <KeyboardAccessoryBar />
      </View>
    </Modal>
  );
}

function PickerModal({
  visible,
  title,
  options,
  onPick,
  onClear,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly string[];
  onPick: (v: string) => void;
  onClear?: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <DisplayTitle size="sm" style={{ marginBottom: 16 }}>{title}</DisplayTitle>
          {options.map((o) => (
            <Pressable key={o} style={styles.modalOption} onPress={() => onPick(o)}>
              <Body style={styles.modalOptionText}>{o}</Body>
            </Pressable>
          ))}
          {onClear ? (
            <Pressable onPress={onClear} style={{ marginTop: 8 }}>
              <Body style={styles.modalClear}>Clear</Body>
            </Pressable>
          ) : null}
          <Pressable onPress={onClose}>
            <Body style={styles.modalCancel}>Cancel</Body>
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
  const [sleep, setSleep] = useState<number | null>(entry?.sleep_quality ?? null);
  const [notes, setNotes] = useState(entry?.notes ?? "");

  useEffect(() => {
    setEnergy(entry?.energy ?? null);
    setMood(entry?.mood ?? null);
    setStress(entry?.stress ?? null);
    setMotivation(entry?.motivation ?? null);
    setSleep(entry?.sleep_quality ?? null);
    setNotes(entry?.notes ?? "");
  }, [entry, visible]);

  const ready = energy != null && mood != null && stress != null && motivation != null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ScrollView
          contentContainerStyle={styles.modalCard}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <DisplayTitle size="sm" style={styles.modalTitle}>
            Daily check-in
          </DisplayTitle>
          <Body size="sm" style={styles.modalIntro}>
            Energy, mood, stress and motivation are required to complete the day.
          </Body>
          <Scale label="Energy" value={energy} onChange={setEnergy} />
          <Scale label="Mood" value={mood} onChange={setMood} />
          <Scale label="Stress" value={stress} onChange={setStress} />
          <Scale label="Motivation" value={motivation} onChange={setMotivation} />
          <Scale label="Sleep quality (optional)" value={sleep} onChange={setSleep} />
          <Label style={styles.scaleLabel}>Reflection</Label>
          <TextInput
            style={styles.notesInput}
            placeholder="One thing you noticed today…"
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <PrimaryButton
            label="Submit now"
            disabled={!ready}
            style={styles.modalSubmit}
            onPress={() =>
              onSave({
                energy,
                mood,
                stress,
                motivation,
                sleep_quality: sleep,
                notes: notes || null,
              })
            }
          />
          <Pressable onPress={onClose}>
            <Body style={styles.modalCancel}>Cancel</Body>
          </Pressable>
        </ScrollView>
        <KeyboardAccessoryBar
          primaryLabel="Submit now"
          onPrimaryPress={() => {
            if (!ready) return;
            void onSave({
              energy,
              mood,
              stress,
              motivation,
              sleep_quality: sleep,
              notes: notes || null,
            });
          }}
          primaryDisabled={!ready}
        />
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
    <View style={styles.scaleBlock}>
      <View style={styles.scaleHeader}>
        <Label style={styles.scaleLabel}>{label}</Label>
        <Text style={styles.scaleValue}>{value ?? "-"}/10</Text>
      </View>
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
  scroll: { paddingBottom: 40, paddingTop: space.xl },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space.lg,
    marginBottom: space.p6,
  },
  headerCopy: { flex: 1 },
  headerDate: { marginTop: space.sm, marginBottom: space.xs },
  dayRow: { flexDirection: "row", alignItems: "flex-end", gap: space.sm, flexWrap: "wrap" },
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.primary, 0.1),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: withAlpha(colors.primary, 0.2),
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  avatarText: {
    fontFamily: fonts.sansSemi,
    color: colors.primary,
    fontSize: typeScale.bodySm.fontSize,
  },
  revealCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.lg,
    borderRadius: radius["2xl"],
    padding: space.p5,
    borderWidth: borders.hairline,
    borderColor: withAlpha(colors.primary, 0.2),
    marginBottom: space.lg,
  },
  revealCopy: { flex: 1 },
  revealKicker: { color: withAlpha(colors.primaryForeground, 0.8) },
  revealTitle: {
    color: colors.primaryForeground,
    marginTop: space.xs,
  },
  revealArrow: {
    fontFamily: fonts.sans,
    fontSize: typeScale.quote.fontSize,
    lineHeight: typeScale.quote.lineHeight,
    color: colors.primaryForeground,
  },
  banner: {
    marginBottom: space.lg,
    backgroundColor: withAlpha(colors.accent, 0.1),
    borderColor: withAlpha(colors.accent, 0.3),
    borderRadius: radius["2xl"],
    padding: space.p4,
  },
  bannerRow: { alignItems: "flex-start", gap: space.md },
  bannerCopy: { flex: 1 },
  bannerTitle: { marginBottom: 2 },
  quoteCard: {
    marginBottom: space.p6,
    padding: space.p6,
  },
  quoteKicker: {
    marginBottom: space.md,
    color: colors.primary,
  },
  quoteText: {
    fontSize: typeScale.bodyLg.fontSize,
    lineHeight: 25,
    letterSpacing: typeScale.displayLg.letterSpacing,
    flexShrink: 1,
    includeFontPadding: false,
  },
  quoteAuthor: { marginTop: space.md },
  statsRow: { flexDirection: "row", gap: space.md, marginBottom: space.p6 },
  statPressable: { flex: 1 },
  statCard: {
    flex: 1,
    padding: space.p4,
    borderRadius: radius["2xl"],
  },
  statCardStreak: { borderColor: withAlpha(colors.destructive, 0.3) },
  statCardJourney: { borderColor: withAlpha(colors.lime, 0.5) },
  statKicker: { color: colors.foreground70 },
  statCaption: {
    marginTop: space.xs,
    fontFamily: fonts.sans,
    fontSize: typeScale.meta.fontSize,
    lineHeight: typeScale.meta.lineHeight,
    color: colors.mutedForeground,
  },
  scoreCard: {
    marginBottom: space["2xl"],
    padding: space.p8,
    overflow: "hidden",
  },
  scoreContent: { alignItems: "center" },
  scoreWatermark: {
    position: "absolute",
    top: space.lg,
    right: space.lg,
    fontSize: typeScale.display6xl.fontSize,
    lineHeight: typeScale.display6xl.lineHeight,
    opacity: 0.05,
    zIndex: 0,
  },
  statValueRow: { flexDirection: "row", alignItems: "flex-end", gap: space.xs, marginTop: space.xs },
  statValue: { lineHeight: 30 },
  statUnit: {
    fontStyle: "normal",
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: space.lg,
    gap: space.md,
  },
  sectionTitle: { marginBottom: 0 },
  sectionCount: { letterSpacing: 0 },
  habitStack: { gap: space.md, marginBottom: space["2xl"] },
  checkInCard: {
    backgroundColor: colors.primary,
    borderRadius: radius["3xl"],
    padding: space.p6,
    marginBottom: space["2xl"],
    borderWidth: borders.hairline,
    borderColor: colors.primary,
    overflow: "hidden",
    position: "relative",
  },
  checkInDone: {
    backgroundColor: colors.card,
    borderColor: colors.ringHairline,
  },
  checkInKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.xs,
  },
  checkInKickerOpen: { color: withAlpha(colors.primaryForeground, 0.8) },
  checkInKickerDone: { color: colors.mutedForeground },
  checkInTitle: {
    fontSize: typeScale.quote.fontSize,
    lineHeight: typeScale.quote.lineHeight,
    letterSpacing: typeScale.quote.letterSpacing,
    marginTop: space.xs,
    marginBottom: space.sm,
  },
  checkInSub: {
    color: withAlpha(colors.primaryForeground, 0.8),
    lineHeight: 23,
  },
  checkInSubDone: { color: colors.mutedForeground },
  checkInOrb: {
    position: "absolute",
    right: -29,
    bottom: -29,
    width: 102,
    height: 102,
    borderRadius: radius.full,
    backgroundColor: colors.primaryForeground,
    opacity: 0.1,
  },
  checkInOrbDone: { backgroundColor: colors.foreground },
  photoCard: {
    borderRadius: radius["3xl"],
    padding: space.p6,
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.lg,
  },
  photoHeaderCopy: { flex: 1 },
  photoTitle: { marginTop: space.xs },
  photoMediaWrap: {
    width: "100%",
    alignSelf: "stretch",
    position: "relative",
  },
  photoBox: {
    width: "100%",
    alignSelf: "stretch",
    borderWidth: borders.thick,
    borderStyle: "dashed",
    borderColor: colors.ringPrimary,
    borderRadius: radius["2xl"],
    aspectRatio: 4 / 5,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.p6,
  },
  photoBoxIcon: { marginBottom: 0 },
  photoCta: { paddingVertical: space.md, marginTop: space.lg },
  photoPreview: {
    width: "100%",
    alignSelf: "stretch",
    aspectRatio: 4 / 5,
    borderRadius: radius["2xl"],
    backgroundColor: colors.muted,
  },
  photoBadge: {
    position: "absolute",
    top: space.md,
    left: space.md,
    backgroundColor: withAlpha(colors.pureBlack, 0.5),
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  photoBadgeText: { color: colors.white },
  photoHint: { textAlign: "center" },
  photoSub: {
    textAlign: "center",
    maxWidth: 220,
  },
  linkRow: { marginTop: space.lg, paddingVertical: 16, alignItems: "center" },
  linkText: { letterSpacing: 2 },
  completeBadge: {
    textAlign: "center",
    marginTop: 8,
  },
  struggleBtn: {
    position: "absolute",
    bottom: 28,
    right: 20,
    height: 38,
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
  struggleBtnText: {
    fontSize: typeScale.bodySm.fontSize,
    lineHeight: typeScale.bodySm.lineHeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withAlpha(colors.pureBlack, 0.4),
    justifyContent: "flex-end",
  },
  modalDismiss: { ...StyleSheet.absoluteFillObject },
  modalSheet: {
    maxHeight: "90%",
    backgroundColor: colors.background,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    zIndex: 1,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    padding: space.p6,
    maxHeight: "90%",
  },
  modalCardInner: {
    padding: space.p6,
  },
  moveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xl,
  },
  moveTitle: { flex: 1, paddingRight: space.md },
  moveClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  moveCloseText: {
    fontSize: typeScale.bodySm.fontSize,
    color: colors.foreground,
    lineHeight: 16,
  },
  moveGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.xl,
  },
  movePill: {
    width: "31%",
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.ringHairline,
    alignItems: "center",
    justifyContent: "center",
  },
  movePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  movePillText: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodySm.fontSize,
    lineHeight: typeScale.bodySm.lineHeight,
    color: colors.foreground,
    textAlign: "center",
  },
  movePillTextSelected: {
    color: colors.primaryForeground,
  },
  moveDurationLabel: {
    marginBottom: space.sm,
  },
  moveMinutesInput: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: space.inputX,
    paddingVertical: space.md,
    fontFamily: fonts.sans,
    fontSize: typeScale.input.fontSize,
    lineHeight: typeScale.input.lineHeight,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
  moveSave: {
    marginTop: space.xl,
  },
  modalOption: {
    paddingVertical: space.inputY,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: { color: colors.foreground },
  modalCancel: {
    textAlign: "center",
    marginTop: 16,
  },
  modalClear: {
    textAlign: "center",
    marginTop: 8,
    color: colors.destructive,
  },
  modalTitle: { marginBottom: space.sm },
  modalIntro: { marginBottom: space.p5 },
  modalSubmit: { paddingVertical: space.md },
  scaleBlock: { marginBottom: space.p5 },
  scaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space.md,
    marginBottom: space.sm,
  },
  scaleLabel: { flex: 1, marginBottom: space.sm },
  scaleValue: {
    fontFamily: fonts.kicker,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.mutedForeground,
  },
  scaleRow: { flexDirection: "row", gap: space.xs },
  scaleDot: {
    flex: 1,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  scaleDotActive: { backgroundColor: colors.primary },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    paddingHorizontal: space.inputX,
    paddingVertical: space.md,
    minHeight: 80,
    marginBottom: space.p6,
    fontFamily: fonts.sans,
    fontSize: typeScale.input.fontSize,
    lineHeight: typeScale.input.lineHeight,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.ringHairline,
  },
});
