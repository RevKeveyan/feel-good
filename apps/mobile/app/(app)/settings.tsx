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
import { CONTACT_EMAIL, type Profile } from "@feelgood/shared";
import { deleteAccount } from "@/lib/api";
import { signOut } from "@/lib/auth";
import {
  ensureNotificationPermissions,
  registerForPushNotifications,
  scheduleDailyReminder,
  scheduleTestReminderInOneMinute,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { uploadLocalImage } from "@/lib/upload-image";
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
import { colors, fonts, radius, space } from "@/src/theme";

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

    if (row?.avatar_path) {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(row.avatar_path, 3600);
      setAvatarUrl(signed?.signedUrl ?? null);
    } else {
      setAvatarUrl(null);
    }
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
        Alert.alert("Permission needed", "Camera access is required for your avatar.");
        return;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Photo library access is required for your avatar.");
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const path = `${auth.user.id}/avatar.jpg`;
      await uploadLocalImage({
        bucket: "avatars",
        path,
        uri: result.assets[0].uri,
        contentType: "image/jpeg",
        upsert: true,
      });

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_path: path })
        .eq("id", auth.user.id);
      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, avatar_path: path } : prev));
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(signed?.signedUrl ?? null);
      Alert.alert("Saved", "Profile photo updated.");
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Something went wrong");
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
              <Body>Upload or take a photo for your avatar</Body>
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
  container: { paddingTop: space.lg, paddingBottom: 48, gap: 10 },
  row: { marginBottom: 0 },
  rowTitle: { marginBottom: 2 },
  avatarCard: { marginBottom: space.sm },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ringPrimary,
  },
  avatarImage: { width: 72, height: 72 },
  avatarText: {
    fontFamily: fonts.sansSemi,
    color: colors.primary,
    fontSize: 22,
  },
  danger: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.destructive + "80",
    borderRadius: radius["2xl"],
    padding: 16,
    backgroundColor: colors.card,
  },
  dangerText: {
    textAlign: "center",
  },
});
