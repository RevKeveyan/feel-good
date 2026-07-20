import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { CONTACT_EMAIL, LEGAL_URLS } from "@feelgood/shared";
import { deleteAccount } from "@/lib/api";
import { signOut } from "@/lib/auth";
import { registerForPushNotifications, scheduleDailyReminder } from "@/lib/notifications";
import { Body, BrandCard, DisplayTitle, Kicker, PrimaryButton, Screen } from "@/components/ui";
import { colors, fonts, radius, space } from "@/src/theme";

export default function SettingsScreen() {
  async function enableReminders() {
    const token = await registerForPushNotifications();
    if (!token) {
      Alert.alert("Permission needed", "Enable notifications in system settings.");
      return;
    }
    await scheduleDailyReminder(9, 0);
    Alert.alert("Reminders on", "Daily reminder scheduled for 9:00 AM.");
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

  return (
    <Screen>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Kicker>← Today</Kicker>
        </Pressable>
        <DisplayTitle style={{ marginTop: space.md, marginBottom: space.lg }}>Settings</DisplayTitle>

        <Pressable onPress={enableReminders}>
          <BrandCard style={styles.row}>
            <Text style={styles.rowTitle}>Daily reminders</Text>
            <Body>9:00 AM push notification</Body>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(LEGAL_URLS.privacy)}>
          <BrandCard style={styles.row}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
          <BrandCard style={styles.row}>
            <Text style={styles.rowTitle}>Terms of Service</Text>
          </BrandCard>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
          <BrandCard style={styles.row}>
            <Text style={styles.rowTitle}>Contact support</Text>
            <Body>{CONTACT_EMAIL}</Body>
          </BrandCard>
        </Pressable>

        <PrimaryButton label="Sign out" onPress={handleSignOut} style={{ marginTop: space.xl }} />

        <Pressable style={styles.danger} onPress={handleDeleteAccount}>
          <Text style={styles.dangerText}>Delete account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, gap: 10 },
  row: { marginBottom: 0 },
  rowTitle: { fontFamily: fonts.sansSemi, color: colors.foreground, marginBottom: 2 },
  danger: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: radius["2xl"],
    padding: 16,
    backgroundColor: colors.card,
  },
  dangerText: {
    fontFamily: fonts.sansSemi,
    color: colors.foreground,
    textAlign: "center",
  },
});
