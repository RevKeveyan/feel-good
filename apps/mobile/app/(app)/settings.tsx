import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { isRunningInExpoGo } from "expo";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft } from "@/components/ui/icons";
import {
  CHALLENGE_LENGTH,
  CONTACT_EMAIL,
  LEGAL_URLS,
  todayISO,
  type Profile,
} from "@feelgood/shared";
import { deleteAccount } from "@/lib/api";
import { signOut } from "@/lib/auth";
import {
  ensureNotificationPermissions,
  registerForPushNotifications,
  scheduleDailyReminder,
  scheduleTestReminderInOneMinute,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { resolveAvatarUrl } from "@/lib/avatar";
import { alertMediaPermissionNeeded } from "@/lib/media-permissions";
import { formatUploadError, uploadLocalImage } from "@/lib/upload-image";
import {
  Body,
  BrandCard,
  DisplayTitle,
  IconLabel,
  Kicker,
  Label,
  OutlineButton,
  PrimaryButton,
  Screen,
} from "@/components/ui";
import { borders, colors, fonts, radius, space, typeScale, withAlpha } from "@/src/theme";

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("FG");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const row = data as Profile | null;
    setProfile(row);

    const name = row?.display_name || auth.user?.email || "FG";
    setInitials(
      name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    );

    setAvatarUrl(await resolveAvatarUrl({ avatarPath: row?.avatar_path, user: auth.user }));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function enableReminders() {
    const allowed = await ensureNotificationPermissions();
    if (!allowed) {
      Alert.alert("Permission needed", "Enable notifications in system settings.");
      return;
    }
    void registerForPushNotifications();
    await scheduleDailyReminder(9, 0);
    if (isRunningInExpoGo()) {
      Alert.alert(
        "Reminders on",
        "Daily local reminder scheduled for 9:00 AM. Remote push needs a development or preview build (not Expo Go).",
      );
      return;
    }
    Alert.alert("Reminders on", "Daily reminder scheduled for 9:00 AM.");
  }

  async function sendTestReminder() {
    const allowed = await ensureNotificationPermissions();
    if (!allowed) {
      Alert.alert("Permission needed", "Enable notifications in system settings.");
      return;
    }
    void registerForPushNotifications();
    await scheduleTestReminderInOneMinute();
    if (isRunningInExpoGo()) {
      Alert.alert(
        "Test scheduled",
        "A local notification will fire in about 1 minute. Keep the app in background. Remote push is unavailable in Expo Go.",
      );
      return;
    }
    Alert.alert("Test scheduled", "A notification will fire in about 1 minute. Keep the app in background.");
  }

  function shiftISODate(iso: string, days: number): string {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  async function setChallengeStartDate(iso: string) {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { error } = await supabase
      .from("profiles")
      .update({ challenge_start_date: iso })
      .eq("id", uid);
    if (error) {
      Alert.alert("Error", error.message || "Could not update challenge day");
      return;
    }

    setProfile((prev) => (prev ? { ...prev, challenge_start_date: iso } : prev));
    router.replace("/(app)/today");
  }

  async function previewDay55() {
    const iso = shiftISODate(todayISO(), -(CHALLENGE_LENGTH - 1));
    await setChallengeStartDate(iso);
  }

  async function resetToDay1() {
    await setChallengeStartDate(todayISO());
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  async function handleDeleteAccount() {
    Alert.alert("Delete account", "This permanently deletes your data. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount();
            router.replace("/auth");
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Delete failed");
          }
        },
      },
    ]);
  }

  function changeAvatar() {
    Alert.alert("Profile photo", "Choose a source", [
      { text: "Cancel", style: "cancel" },
      { text: "Take photo", onPress: () => void pickAndUpload("camera") },
      { text: "Choose from library", onPress: () => void pickAndUpload("library") },
    ]);
  }

  async function pickAndUpload(source: "camera" | "library") {
    if (uploading) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        alertMediaPermissionNeeded("Camera access is required for your avatar.");
        return;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alertMediaPermissionNeeded("Photo library access is required for your avatar.");
        return;
      }
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
            mediaTypes: ["images"],
          });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const path = `${auth.user.id}/avatar.jpg`;
      await uploadLocalImage({
        bucket: "avatars",
        path,
        uri: asset.uri,
        contentType: "image/jpeg",
        upsert: true,
      });

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_path: path })
        .eq("id", auth.user.id);
      if (error) throw new Error(error.message || "Could not save profile photo");

      setProfile((prev) => (prev ? { ...prev, avatar_path: path } : prev));
      setAvatarUrl(await resolveAvatarUrl({ avatarPath: path, user: auth.user }));
      Alert.alert("Saved", "Profile photo updated.");
    } catch (e) {
      Alert.alert("Upload failed", formatUploadError(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Pressable onPress={() => router.back()}>
          <IconLabel
            gap={6}
            icon={<ArrowLeft size={14} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>Today</Kicker>
          </IconLabel>
        </Pressable>
        <DisplayTitle style={{ marginTop: space.md, marginBottom: space.lg }}>Settings</DisplayTitle>

        <BrandCard style={styles.avatarCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Label style={styles.rowTitle}>
                {profile?.display_name?.trim() || "Your profile"}
              </Label>
              <Body>
                {avatarUrl
                  ? "Change photo to replace your current avatar"
                  : "Upload a photo for your profile"}
              </Body>
            </View>
          </View>
          <OutlineButton
            label={uploading ? "Uploading…" : "Change photo"}
            onPress={changeAvatar}
            disabled={uploading}
            loading={uploading}
            style={{ marginTop: space.md }}
          />
        </BrandCard>

        <Pressable onPress={() => router.push("/(app)/progress")}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>My progress</Label>
            <Body>Vision board and all {CHALLENGE_LENGTH} days</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={enableReminders}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Daily reminders</Label>
            <Body>9:00 AM local notification</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={sendTestReminder}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Test reminder (1 min)</Label>
            <Body>Fires once — use to verify notifications</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => void previewDay55()}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Preview Day 55</Label>
            <Body>Sets start date so today is Day {CHALLENGE_LENGTH}</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => void resetToDay1()}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Reset to Day 1</Label>
            <Body>Sets challenge start date to today</Body>
          </BrandCard>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/(app)/onboarding", params: { edit: "1" } })
          }
        >
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Onboarding</Label>
            <Body>Fill or change your answers — existing ones are kept</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => router.push("/privacy")}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Privacy Policy</Label>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => router.push("/terms")}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Terms of Service</Label>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(LEGAL_URLS.support)}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Support</Label>
            <Body>Help, account deletion, and contact</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
          <BrandCard style={styles.row}>
            <Label style={styles.rowTitle}>Contact support</Label>
            <Body>{CONTACT_EMAIL}</Body>
          </BrandCard>
        </Pressable>

        <PrimaryButton label="Sign out" onPress={handleSignOut} style={{ marginTop: space.xl }} />

        <Pressable style={styles.danger} onPress={handleDeleteAccount}>
          <Label style={styles.dangerText}>Delete account</Label>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, paddingBottom: space.p6, gap: space.md },
  row: { marginBottom: 0 },
  rowTitle: { marginBottom: 2 },
  avatarCard: { marginBottom: space.sm },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: withAlpha(colors.foreground, 0.1),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: withAlpha(colors.foreground, 0.2),
  },
  avatarImage: { width: 72, height: 72 },
  avatarText: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    fontSize: typeScale.display2xl.fontSize - 2,
    lineHeight: typeScale.display2xl.lineHeight - 2,
  },
  danger: {
    marginTop: space.xl,
    borderWidth: borders.hairline,
    borderColor: withAlpha(colors.destructive, 0.5),
    borderRadius: radius["2xl"],
    padding: space.lg,
    backgroundColor: colors.card,
  },
  dangerText: {
    textAlign: "center",
  },
});
