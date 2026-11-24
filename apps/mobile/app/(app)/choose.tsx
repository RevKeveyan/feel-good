import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import type { AreaAccessStatus } from "@feelgood/shared";
import {
  fetchAccessProfile,
  isCurrentUserAdmin,
  requestAreaAccess,
  type AccessProfile,
} from "@/lib/access";
import { signOut } from "@/lib/auth";
import {
  ArrowRight,
  Body,
  BrandWordmark,
  CheckCircle2,
  Flame,
  GhostButton,
  Lock,
  LogOut,
  OutlineButton,
  PrimaryButton,
  RefreshCw,
  Screen,
  Shield,
  Stethoscope,
} from "@/components/ui";
import { borders, colors, fonts, radius, space, typeScale } from "@/src/theme";

type AreaKey = "challenge" | "clinic";

const COPY: Record<
  AreaKey,
  { title: string; body: string; approvedRoute: string; openLabel: string }
> = {
  challenge: {
    title: "Challenge",
    body: "Your 55-day journey, daily habits, transformation and cash prizes.",
    approvedRoute: "/(app)/overview",
    openLabel: "Open Challenge",
  },
  clinic: {
    title: "Clinic",
    body: "Your health forms, results, treatment plan and product details.",
    approvedRoute: "/(app)/clinic",
    openLabel: "Open Clinic",
  },
};

export default function ChooseScreen() {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<AreaKey | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, admin] = await Promise.all([fetchAccessProfile(), isCurrentUserAdmin()]);
    setProfile(p);
    setIsAdmin(admin);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onCheckApproval() {
    await load();
    Alert.alert("Updated", "Approval status refreshed.");
  }

  async function onSignOut() {
    await signOut();
    router.replace("/auth");
  }

  async function onEnter(area: AreaKey) {
    if (!profile) return;
    const route = COPY[area].approvedRoute;
    if (area === "challenge" && !profile.onboarding_completed_at) {
      router.push("/(app)/onboarding");
      return;
    }
    router.push(route as never);
  }

  async function onRequest(area: AreaKey) {
    setBusy(area);
    try {
      await requestAreaAccess(area);
      await load();
      Alert.alert("Request sent", "Your access request is awaiting approval.");
    } catch (e) {
      Alert.alert("Could not request", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(null);
    }
  }

  const challengeStatus = profile?.challenge_status ?? "awaiting";
  const clinicStatus = profile?.clinic_status ?? "awaiting";

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {isAdmin ? (
            <OutlineButton
              label="Manage approvals"
              onPress={() => router.push("/(app)/admin")}
              leadingIcon={<Shield size={16} color={colors.foreground} strokeWidth={2} />}
              style={styles.headerBtn}
            />
          ) : (
            <View />
          )}
          <GhostButton
            label="Sign out"
            onPress={() => void onSignOut()}
            leadingIcon={<LogOut size={16} color={colors.foreground70} strokeWidth={2} />}
            style={styles.headerBtn}
          />
        </View>

        <BrandWordmark size="md" style={styles.brand} />

        <View style={styles.cards}>
          <AreaCard
            area="challenge"
            status={challengeStatus}
            loading={loading || busy === "challenge"}
            onEnter={() => void onEnter("challenge")}
            onRequest={() => void onRequest("challenge")}
          />
          <AreaCard
            area="clinic"
            status={clinicStatus}
            loading={loading || busy === "clinic"}
            onEnter={() => void onEnter("clinic")}
            onRequest={() => void onRequest("clinic")}
          />
        </View>

        <GhostButton
          label="Check approval"
          onPress={() => void onCheckApproval()}
          disabled={loading}
          leadingIcon={<RefreshCw size={16} color={colors.foreground70} strokeWidth={2} />}
          style={styles.check}
        />

        <Pressable onPress={() => router.push("/(app)/settings")} style={styles.settings}>
          <Body size="sm" style={styles.settingsText}>
            Settings
          </Body>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function AreaCard({
  area,
  status,
  loading,
  onEnter,
  onRequest,
}: {
  area: AreaKey;
  status: AreaAccessStatus;
  loading: boolean;
  onEnter: () => void;
  onRequest: () => void;
}) {
  const copy = COPY[area];
  const approved = status === "approved";
  const Icon = area === "challenge" ? Flame : Stethoscope;

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Icon size={32} color={colors.primary} strokeWidth={1.5} />
        {approved ? (
          <View style={styles.approvedPill}>
            <CheckCircle2 size={14} color={colors.primaryForeground} strokeWidth={2} />
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.cardTitle}>{copy.title}</Text>
      <Text style={styles.cardBody}>{copy.body}</Text>
      <View style={styles.cardCta}>
        {approved ? (
          <PrimaryButton
            label={copy.openLabel}
            onPress={onEnter}
            disabled={loading}
            trailingIcon={<ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2} />}
          />
        ) : status === "awaiting" ? (
          <OutlineButton
            label="Awaiting approval"
            onPress={() => {}}
            disabled
            leadingIcon={<Lock size={16} color={colors.foreground} strokeWidth={2} />}
          />
        ) : (
          <OutlineButton
            label="Request access"
            onPress={onRequest}
            disabled={loading}
            loading={loading}
            trailingIcon={<ArrowRight size={16} color={colors.foreground} strokeWidth={2} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: space.lg,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.xl,
  },
  headerBtn: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  brand: {
    alignSelf: "center",
    marginBottom: space["2xl"],
  },
  cards: {
    flexDirection: "column",
    gap: space.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    padding: 24,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  approvedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  approvedText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.primaryForeground,
  },
  cardTitle: {
    fontFamily: fonts.displayRegular,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.foreground,
    marginTop: space.p6,
  },
  cardBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
    marginTop: space.md,
  },
  cardCta: {
    marginTop: space.p6,
  },
  check: {
    marginTop: space["2xl"],
    alignSelf: "flex-end",
  },
  settings: {
    marginTop: space.xl,
    alignItems: "center",
    paddingVertical: space.md,
  },
  settingsText: {
    color: colors.mutedForeground,
  },
});
