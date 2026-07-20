export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (__DEV__) {
    console.log("[analytics]", name, props ?? {});
  }
}

export function initAnalytics() {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!sentryDsn && !posthogKey && __DEV__) {
    console.log("[analytics] Configure EXPO_PUBLIC_SENTRY_DSN or EXPO_PUBLIC_POSTHOG_KEY for production");
  }
}
