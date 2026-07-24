import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { flushOfflineQueue } from "@/lib/offline-queue";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
      if (data.session) void flushOfflineQueue();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (session) void flushOfflineQueue();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#EBE5DD" }}>
        <ActivityIndicator color="#222222" />
      </View>
    );
  }

  if (!authed) return <Redirect href="/auth" />;
  return <Redirect href="/(app)/today" />;
}
