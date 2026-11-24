import { Redirect, Stack, usePathname, useSegments } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { isPasswordRecoveryPending } from "@/lib/auth";
import {
  fetchAccessProfile,
  isCurrentUserAdmin,
  type AccessProfile,
} from "@/lib/access";
import { supabase } from "@/lib/supabase";
import { colors } from "@/src/theme";

const OPEN_ROUTES = new Set(["choose", "settings"]);
const ADMIN_ROUTES = new Set(["admin"]);
const CLINIC_ROUTES = new Set(["clinic"]);
const CHALLENGE_ROUTES = new Set([
  "overview",
  "today",
  "day",
  "onboarding",
  "mindset",
  "complete",
  "progress",
]);

export default function AppLayout() {
  const pathname = usePathname();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessReady, setAccessReady] = useState(false);

  const refreshAccess = useCallback(async () => {
    const [p, admin] = await Promise.all([fetchAccessProfile(), isCurrentUserAdmin()]);
    setProfile(p);
    setIsAdmin(admin);
    setAccessReady(true);
  }, []);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const hasSession = !!data.session;
        setAuthed(hasSession);
        setRecovery(isPasswordRecoveryPending());
        if (hasSession) await refreshAccess();
        else {
          setProfile(null);
          setIsAdmin(false);
          setAccessReady(true);
        }
      })
      .catch((e) => {
        console.warn("[auth] getSession failed", e instanceof Error ? e.message : e);
        setAuthed(false);
        setAccessReady(true);
      })
      .finally(() => {
        setReady(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setRecovery(isPasswordRecoveryPending());
      if (session) void refreshAccess();
      else {
        setProfile(null);
        setIsAdmin(false);
        setAccessReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshAccess]);

  useEffect(() => {
    if (authed) void refreshAccess();
  }, [pathname, authed, refreshAccess]);

  if (!ready || (authed && !accessReady)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  if (!authed) return <Redirect href="/auth" />;
  if (recovery) return <Redirect href="/auth/reset" />;

  const routeKey = String((segments as string[])[1] ?? "choose");

  if (!OPEN_ROUTES.has(routeKey) && !ADMIN_ROUTES.has(routeKey) && !CLINIC_ROUTES.has(routeKey) && !CHALLENGE_ROUTES.has(routeKey)) {
    // unknown under (app)
  } else if (ADMIN_ROUTES.has(routeKey) && !isAdmin) {
    return <Redirect href="/(app)/choose" />;
  } else if (CLINIC_ROUTES.has(routeKey) && profile?.clinic_status !== "approved" && !isAdmin) {
    return <Redirect href="/(app)/choose" />;
  } else if (CHALLENGE_ROUTES.has(routeKey) && profile?.challenge_status !== "approved" && !isAdmin) {
    return <Redirect href="/(app)/choose" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="choose" />
      <Stack.Screen name="overview" />
      <Stack.Screen name="today" />
      <Stack.Screen name="day/[day]" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="mindset" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="clinic" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
