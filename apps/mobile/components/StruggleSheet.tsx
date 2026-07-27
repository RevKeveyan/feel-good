import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View, Linking } from "react-native";
import { STRUGGLE_QUOTES, STRUGGLE_REFRAMES, pickRandom, CONTACT_EMAIL, todayISO, type StruggleAction } from "@feelgood/shared";
import { supabase } from "@/lib/supabase";
import { Body, DisplayTitle, Label } from "@/components/ui";
import { colors, radius } from "@/src/theme";

type ViewState =
  | { kind: "menu" }
  | { kind: "breathwork" }
  | { kind: "tiny_task" }
  | { kind: "text"; title: string; body: string };

const ACTIONS: { action: StruggleAction; title: string; subtitle: string }[] = [
  { action: "breathwork", title: "1-minute breathwork", subtitle: "Box breathing" },
  { action: "tiny_task", title: "A tiny task", subtitle: "Drink one glass of water" },
  { action: "reframe", title: "Mindset reframe", subtitle: "Shift perspective" },
  { action: "quote", title: "Motivational quote", subtitle: "Words to lean on" },
  { action: "community", title: "Reach out", subtitle: "Email support" },
];

export function StruggleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [view, setView] = useState<ViewState>({ kind: "menu" });
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    if (!visible) setView({ kind: "menu" });
  }, [visible]);

  useEffect(() => {
    if (view.kind !== "breathwork") return;
    const t = setInterval(() => setSeconds((s) => (s <= 1 ? 4 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [view.kind]);

  async function logAction(action: StruggleAction) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await supabase.from("struggle_moments").insert({
      user_id: auth.user.id,
      entry_date: todayISO(),
      action_taken: action,
    });
  }

  async function handle(action: StruggleAction) {
    await logAction(action);
    if (action === "breathwork") {
      setView({ kind: "breathwork" });
      return;
    }
    if (action === "tiny_task") {
      setView({
        kind: "text",
        title: "Drink one glass of water",
        body: "Right now. That is enough for this moment.",
      });
      return;
    }
    if (action === "reframe") {
      setView({ kind: "text", title: "Reframe", body: pickRandom(STRUGGLE_REFRAMES) });
      return;
    }
    if (action === "quote") {
      setView({ kind: "text", title: "Quote", body: pickRandom(STRUGGLE_QUOTES) });
      return;
    }
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Feel%20Good%20support`);
    Alert.alert("Support", "Opening email to reach our team.");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <DisplayTitle size="sm" style={{ marginBottom: 12 }}>
            Hard day?
          </DisplayTitle>
          {view.kind === "menu" &&
            ACTIONS.map((a) => (
              <Pressable key={a.action} style={styles.option} onPress={() => void handle(a.action)}>
                <Label>{a.title}</Label>
                <Body>{a.subtitle}</Body>
              </Pressable>
            ))}
          {view.kind === "breathwork" && (
            <View style={styles.center}>
              <DisplayTitle size="xl">{seconds}</DisplayTitle>
              <Body>Breathe in · hold · out · pause</Body>
            </View>
          )}
          {view.kind === "text" && (
            <View>
              <Label>{view.title}</Label>
              <Body style={{ marginTop: 8 }}>{view.body}</Body>
            </View>
          )}
          <Pressable
            onPress={view.kind === "menu" ? onClose : () => setView({ kind: "menu" })}
            style={{ marginTop: 16 }}
          >
            <Body style={styles.cancel}>{view.kind === "menu" ? "Close" : "Back"}</Body>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    padding: 24,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  center: { alignItems: "center", paddingVertical: 24 },
  cancel: {
    textAlign: "center",
  },
});
