import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { completeSessionFromUrl, parseAuthCallbackUrl } from "@/lib/auth";
import { colors } from "@/src/theme";

export default function AuthCallbackScreen() {
  const finished = useRef(false);
  const liveUrl = Linking.useURL();

  useEffect(() => {
    let cancelled = false;

    async function finish(url: string | null) {
      if (cancelled || finished.current || !url) return;
      const { access_token, refresh_token } = parseAuthCallbackUrl(url);
      if (!access_token || !refresh_token) return;

      finished.current = true;
      try {
        await completeSessionFromUrl(url);
        if (!cancelled) router.replace("/");
      } catch {
        if (!cancelled) router.replace("/auth");
      }
    }

    void finish(liveUrl);
    void Linking.getInitialURL().then((url) => void finish(url));
    const sub = Linking.addEventListener("url", ({ url }) => {
      void finish(url);
    });

    const timeout = setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        router.replace("/auth");
      }
    }, 8000);

    return () => {
      cancelled = true;
      sub.remove();
      clearTimeout(timeout);
    };
  }, [liveUrl]);

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
