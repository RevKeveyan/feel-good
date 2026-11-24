import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router, useFocusEffect } from "expo-router";
import {
  CLINIC_DOC_LABELS,
  CLINIC_DOC_TYPES,
  type AreaAccessStatus,
  type ClinicDocType,
} from "@feelgood/shared";
import { isCurrentUserAdmin } from "@/lib/access";
import { supabase } from "@/lib/supabase";
import { uploadClinicPdf } from "@/lib/upload-pdf";
import {
  Body,
  Check,
  FileText,
  GhostButton,
  OutlineButton,
  PrimaryButton,
  RotateCcw,
  Screen,
  Shield,
  X,
} from "@/components/ui";
import { borders, colors, fonts, radius, space, typeScale, withAlpha } from "@/src/theme";

type AdminUser = {
  id: string;
  display_name: string | null;
  email: string | null;
  challenge_status: AreaAccessStatus;
  clinic_status: AreaAccessStatus;
};

export default function AdminScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const admin = await isCurrentUserAdmin();
    if (!admin) {
      setLoading(false);
      router.replace("/(app)/choose");
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, challenge_status, clinic_status")
      .order("display_name", { ascending: true });
    if (error) {
      Alert.alert("Could not load users", error.message);
      setLoading(false);
      return;
    }
    setUsers(
      (data ?? []).map((row) => ({
        id: row.id as string,
        display_name: (row.display_name as string | null) ?? null,
        email: null,
        challenge_status: (row.challenge_status as AreaAccessStatus) ?? "awaiting",
        clinic_status: (row.clinic_status as AreaAccessStatus) ?? "awaiting",
      })),
    );
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function setStatus(userId: string, area: "challenge" | "clinic", status: AreaAccessStatus) {
    setBusy(`${userId}-${area}`);
    const patch =
      area === "challenge" ? { challenge_status: status } : { clinic_status: status };
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    setBusy(null);
    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }
    await load();
  }

  async function uploadDoc(userId: string, docType: ClinicDocType) {
    const picked = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setBusy(`${userId}-${docType}`);
    try {
      await uploadClinicPdf({ userId, docType, uri: asset.uri });
      Alert.alert("Uploaded", `${CLINIC_DOC_LABELS[docType]} saved.`);
    } catch (e) {
      Alert.alert("Upload failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Body size="sm" style={styles.back}>
            Back
          </Body>
        </Pressable>
        <View style={styles.titleRow}>
          <Shield size={24} color={colors.foreground} strokeWidth={2} />
          <Text style={styles.title}>The Feel Good Society Admin</Text>
        </View>
        <Body style={styles.lead}>Review registrations and upload clinic PDFs per client.</Body>

        {loading ? <Body>Loading…</Body> : null}

        {users.map((user) => {
          const open = expanded === user.id;
          return (
            <View key={user.id} style={styles.card}>
              <Pressable onPress={() => setExpanded(open ? null : user.id)}>
                <Text style={styles.name}>{user.display_name || "Member"}</Text>
                <Body size="sm" style={styles.meta}>
                  Challenge: {labelStatus(user.challenge_status)} · Clinic:{" "}
                  {labelStatus(user.clinic_status)}
                </Body>
              </Pressable>

              {open ? (
                <View style={styles.panel}>
                  <AreaActions
                    title="Challenge"
                    status={user.challenge_status}
                    busy={busy === `${user.id}-challenge`}
                    onApprove={() => void setStatus(user.id, "challenge", "approved")}
                    onDecline={() => void setStatus(user.id, "challenge", "not_approved")}
                    onReviewAgain={() => void setStatus(user.id, "challenge", "awaiting")}
                  />
                  <AreaActions
                    title="Clinic"
                    status={user.clinic_status}
                    busy={busy === `${user.id}-clinic`}
                    onApprove={() => void setStatus(user.id, "clinic", "approved")}
                    onDecline={() => void setStatus(user.id, "clinic", "not_approved")}
                    onReviewAgain={() => void setStatus(user.id, "clinic", "awaiting")}
                  />

                  <Text style={styles.section}>Clinic PDFs</Text>
                  {CLINIC_DOC_TYPES.map((docType) => {
                    const uploading = busy === `${user.id}-${docType}`;
                    return (
                      <Pressable
                        key={docType}
                        onPress={() => void uploadDoc(user.id, docType)}
                        disabled={uploading}
                        style={styles.uploadCell}
                      >
                        <FileText size={16} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.uploadText}>
                          {uploading ? "Uploading…" : `Upload ${CLINIC_DOC_LABELS[docType]}`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

function AreaActions({
  title,
  status,
  busy,
  onApprove,
  onDecline,
  onReviewAgain,
}: {
  title: string;
  status: AreaAccessStatus;
  busy: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onReviewAgain: () => void;
}) {
  return (
    <View style={styles.areaBlock}>
      <Text style={styles.areaTitle}>{title}</Text>
      <Text style={styles.statusText}>{labelStatus(status)}</Text>
      <View style={styles.row}>
        {status !== "approved" ? (
          <PrimaryButton
            label="Approve"
            onPress={onApprove}
            disabled={busy}
            leadingIcon={<Check size={16} color={colors.primaryForeground} strokeWidth={2} />}
            style={styles.smallBtn}
          />
        ) : null}
        {status !== "not_approved" ? (
          <OutlineButton
            label={status === "approved" ? "Revoke" : "Decline"}
            onPress={onDecline}
            disabled={busy}
            leadingIcon={<X size={16} color={colors.foreground} strokeWidth={2} />}
            style={styles.smallBtn}
          />
        ) : null}
        {status === "not_approved" ? (
          <GhostButton
            label="Review again"
            onPress={onReviewAgain}
            disabled={busy}
            leadingIcon={<RotateCcw size={16} color={colors.foreground70} strokeWidth={2} />}
            style={styles.smallBtn}
          />
        ) : null}
      </View>
    </View>
  );
}

function labelStatus(status: AreaAccessStatus): string {
  if (status === "approved") return "Approved";
  if (status === "not_approved") return "Not approved";
  return "Awaiting";
}

const styles = StyleSheet.create({
  scroll: { paddingTop: space.lg, paddingBottom: 48 },
  back: { color: colors.mutedForeground, marginBottom: space.md },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 24,
    lineHeight: 30,
    color: colors.foreground,
  },
  lead: { marginBottom: space.xl, color: colors.mutedForeground },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    padding: space.p5,
    marginBottom: space.md,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodyBase.fontSize,
    color: colors.foreground,
  },
  meta: { marginTop: space.xs, color: colors.mutedForeground },
  panel: { marginTop: space.lg },
  areaBlock: { marginBottom: space.lg },
  areaTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.foreground,
  },
  statusText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: space.xs,
  },
  section: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.mutedForeground,
    marginBottom: space.sm,
  },
  row: { flexDirection: "row", gap: space.sm, flexWrap: "wrap", marginTop: space.md },
  smallBtn: { flexGrow: 1, paddingVertical: space.sm },
  uploadCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: withAlpha(colors.foreground, 0.1),
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    marginBottom: space.sm,
  },
  uploadText: {
    fontFamily: fonts.sansSemi,
    fontSize: typeScale.bodySm.fontSize,
    color: colors.foreground,
    flex: 1,
  },
});
