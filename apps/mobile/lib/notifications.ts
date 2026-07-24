import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { supabase } from "./supabase";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null = null;
let handlerReady = false;

async function getNotifications(): Promise<NotificationsModule> {
  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }
  if (!handlerReady) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerReady = true;
  }
  return notificationsModule;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
}

export async function registerForPushNotifications(): Promise<string | null> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) return null;

  if (isRunningInExpoGo()) {
    return null;
  }

  const Notifications = await getNotifications();
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const platform = Platform.OS === "ios" ? "ios" : "android";

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return token;

  try {
    await supabase.functions.invoke("register-device", {
      body: { token, platform },
    });
  } catch {
    // Local reminders still work if Edge Function is not deployed yet
  }

  return token;
}

export async function scheduleDailyReminder(hour = 9, minute = 0) {
  const Notifications = await getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Feel Good Five",
      body: "Complete today's challenge and keep your streak alive.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleTestReminderInOneMinute() {
  const Notifications = await getNotifications();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Feel Good Five (test)",
      body: "If you see this, local notifications work.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      repeats: false,
    },
  });
}
