import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import {
  useFonts,
  LeagueSpartan_400Regular,
  LeagueSpartan_600SemiBold,
  LeagueSpartan_700Bold,
  LeagueSpartan_800ExtraBold,
} from "@expo-google-fonts/league-spartan";
import {
  Raleway_500Medium,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from "@expo-google-fonts/open-sans";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { initAnalytics } from "@/lib/analytics";
import { completeSessionFromUrl, parseAuthCallbackUrl } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors } from "@/src/theme";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  /expo-notifications:.*Expo Go/,
]);

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

function isAuthCallbackUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.includes("auth/reset") ||
    lower.includes("auth/callback") ||
    parseAuthCallbackUrl(url).access_token != null
  );
}

async function handleAuthUrl(url: string) {
  if (!isAuthCallbackUrl(url)) return;
  const { access_token, refresh_token, type } = parseAuthCallbackUrl(url);
  if (!access_token || !refresh_token) return;
  await completeSessionFromUrl(url);
  if (type === "recovery" || url.toLowerCase().includes("auth/reset")) {
    router.replace("/auth/reset");
  } else if (url.toLowerCase().includes("auth/callback")) {
    router.replace("/");
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    LeagueSpartan_700Bold,
    LeagueSpartan_800ExtraBold,
    Raleway_500Medium,
    Raleway_600SemiBold,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    PlayfairDisplay_700Bold,
  });
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/auth/reset");
      }
    });

    void Linking.getInitialURL().then((url) => {
      if (url) void handleAuthUrl(url).catch(() => undefined);
    });
    const linkSub = Linking.addEventListener("url", ({ url }) => {
      void handleAuthUrl(url).catch(() => undefined);
    });

    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  if (!fontsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
      </Stack>
    </QueryClientProvider>
  );
}
