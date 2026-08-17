import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { isPasswordRecoveryPending } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { flushOfflineQueue } from "@/lib/offline-queue";
import { colors } from "@/src/theme";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setRecovery(isPasswordRecoveryPending());
      setReady(true);
      if (data.session && !isPasswordRecoveryPending()) void flushOfflineQueue();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      setRecovery(isPasswordRecoveryPending());
      if (session && !isPasswordRecoveryPending()) void flushOfflineQueue();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  if (!authed) return <Redirect href="/auth" />;
  if (recovery) return <Redirect href="/auth/reset" />;
  return <Redirect href="/(app)/overview" />;
}
