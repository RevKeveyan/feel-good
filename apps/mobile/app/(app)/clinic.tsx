import { useCallback, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  CLINIC_CHECKIN_FORM_URL,
  CLINIC_DOC_LABELS,
  CLINIC_DOC_TYPES,
  CLINIC_INTAKE_FORM_URL,
  type ClinicDocType,
  type ClinicDocument,
} from "@feelgood/shared";
import { ContactUs } from "@/components/ContactUs";
import { supabase } from "@/lib/supabase";
import {
  ArrowUpRight,
  Body,
  BrandWordmark,
  ClipboardCheck,
  ClipboardList,
  DisplayTitle,
  FileText,
  Kicker,
  Screen,
  Stethoscope,
} from "@/components/ui";
import { colors, fonts, iconSizes, radius, space, withAlpha } from "@/src/theme";

export default function ClinicScreen() {
  const [docs, setDocs] = useState<Partial<Record<ClinicDocType, ClinicDocument>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("clinic_documents")
      .select("*")
      .eq("user_id", auth.user.id);
    if (error) {
      Alert.alert("Could not load documents", error.message);
      setLoading(false);
      return;
    }
    const map: Partial<Record<ClinicDocType, ClinicDocument>> = {};
    for (const row of data ?? []) {
      const type = row.doc_type as ClinicDocType;
      map[type] = row as ClinicDocument;
    }
    setDocs(map);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function openDoc(docType: ClinicDocType) {
    const row = docs[docType];
    if (!row) {
      Alert.alert("Not available yet", "Your clinician has not uploaded this file.");
      return;
    }
    const { data, error } = await supabase.storage
      .from("clinic-docs")
      .createSignedUrl(row.storage_path, 120);
    if (error || !data?.signedUrl) {
      Alert.alert("Could not open file", error?.message ?? "Try again.");
      return;
    }
    await Linking.openURL(data.signedUrl);
  }

  const intakeReady = Boolean(CLINIC_INTAKE_FORM_URL);
  const checkInReady = Boolean(CLINIC_CHECKIN_FORM_URL);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.headerCopy}>
            <Pressable onPress={() => router.replace("/(app)/choose")} style={styles.backBtn}>
              <Kicker style={styles.back}>← App areas</Kicker>
            </Pressable>
            <DisplayTitle size="md" style={styles.title}>
              Clinic Clients
            </DisplayTitle>
          </View>
          <BrandWordmark size="headerLg" style={styles.brandLogo} />
        </View>
        <Body style={styles.intro}>
          Your health forms, results, treatment plan and personalised product details all in one
          place.
        </Body>

        <View style={styles.intakeBox}>
          <View style={styles.intakeRow}>
            <Stethoscope size={iconSizes.lg} color={colors.primary} strokeWidth={2} />
            <Kicker style={styles.intakeKicker}>Start here</Kicker>
          </View>
          <Text style={styles.intakeTitle}>Complete your intake form</Text>
          <Text style={styles.intakeBody}>
            Tell us about your health history, current concerns and goals so we can set good
            foundations now.
          </Text>
          <Pressable
            onPress={() => {
              if (CLINIC_INTAKE_FORM_URL) void Linking.openURL(CLINIC_INTAKE_FORM_URL);
            }}
            disabled={!intakeReady}
            style={[styles.redPill, !intakeReady && styles.redPillDisabled]}
          >
            <ClipboardList size={16} color={colors.primaryForeground} strokeWidth={2} />
            <Text style={styles.redPillText}>
              {intakeReady ? "Intake form" : "Intake form, coming soon"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.docStack}>
          {CLINIC_DOC_TYPES.map((docType) => {
            const ready = !!docs[docType];
            return (
              <Pressable
                key={docType}
                onPress={() => void openDoc(docType)}
                disabled={!ready || loading}
                style={styles.docRow}
              >
                <View style={styles.docIcon}>
                  <FileText size={20} color={colors.primaryForeground} strokeWidth={2} />
                </View>
                <View style={styles.docCopy}>
                  <Text style={styles.docTitle}>{CLINIC_DOC_LABELS[docType]}</Text>
                  <Text style={styles.docSub}>{ready ? "Open PDF" : "Not uploaded yet"}</Text>
                </View>
                {ready ? (
                  <ArrowUpRight size={16} color={colors.mutedForeground} strokeWidth={2} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.checkInCard}>
          <View style={styles.checkInRow}>
            <View style={styles.docIcon}>
              <ClipboardCheck size={20} color={colors.primaryForeground} strokeWidth={2} />
            </View>
            <View style={styles.docCopy}>
              <Text style={styles.docTitle}>Check-in form</Text>
              <Text style={styles.docSub}>You&apos;ll be advised when to complete this via message.</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (CLINIC_CHECKIN_FORM_URL) void Linking.openURL(CLINIC_CHECKIN_FORM_URL);
            }}
            disabled={!checkInReady}
            style={[styles.redPill, styles.redPillFull, !checkInReady && styles.redPillDisabled]}
          >
            <ClipboardCheck size={16} color={colors.primaryForeground} strokeWidth={2} />
            <Text style={styles.redPillText}>
              {checkInReady ? "Open check-in form" : "Unlocks next check-in"}
            </Text>
          </Pressable>
        </View>

        <ContactUs unisex />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: space.lg, paddingBottom: 48 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.md,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  backBtn: { marginBottom: space.sm },
  back: { color: colors.mutedForeground },
  brandLogo: { flexShrink: 0 },
  title: { marginBottom: 0 },
  intro: { marginBottom: space.xl, color: colors.mutedForeground },
  intakeBox: {
    backgroundColor: colors.foreground,
    borderRadius: radius["3xl"],
    padding: space.p5,
    marginBottom: space.lg,
  },
  intakeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  intakeKicker: {
    color: colors.background,
    letterSpacing: 1,
  },
  intakeTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.background,
    marginTop: space.sm,
  },
  intakeBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: withAlpha(colors.background, 0.7),
    marginTop: space.xs,
  },
  redPill: {
    marginTop: space.lg,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  redPillFull: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  redPillDisabled: {
    opacity: 1,
  },
  redPillText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.primaryForeground,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  docStack: { gap: space.md, marginBottom: space.lg },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: space.lg,
    borderWidth: 1,
    borderColor: withAlpha(colors.foreground, 0.1),
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  docCopy: { flex: 1, minWidth: 0 },
  docTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.foreground,
  },
  docSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  checkInCard: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    padding: space.lg,
    borderWidth: 1,
    borderColor: withAlpha(colors.foreground, 0.1),
    marginBottom: space.lg,
  },
  checkInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
  },
});
