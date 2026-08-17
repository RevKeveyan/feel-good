import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { isPasswordRecoveryPending } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { colors } from "@/src/theme";

export default function AppLayout() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setAuthed(!!data.session);
        setRecovery(isPasswordRecoveryPending());
      })
      .catch((e) => {
        console.warn("[auth] getSession failed", e instanceof Error ? e.message : e);
        setAuthed(false);
      })
      .finally(() => {
        setReady(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setRecovery(isPasswordRecoveryPending());
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  if (!authed) return <Redirect href="/auth" />;
  if (recovery) return <Redirect href="/auth/reset" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="overview" />
      <Stack.Screen name="today" />
      <Stack.Screen name="day/[day]" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="mindset" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="progress" />
    </Stack>
  );
}
