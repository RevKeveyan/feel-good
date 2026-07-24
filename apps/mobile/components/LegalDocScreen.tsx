import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import type { LegalDocument } from "@feelgood/shared";
import { Body, DisplayTitle, Kicker, Label, Screen } from "@/components/ui";
import { colors, space } from "@/src/theme";

export function LegalDocScreen({ doc }: { doc: LegalDocument }) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Kicker>← Back</Kicker>
        </Pressable>
        <DisplayTitle style={styles.title}>{doc.title}</DisplayTitle>
        <Body size="sm" style={styles.updated}>
          Last updated: {doc.lastUpdated}
        </Body>

        {doc.intro.map((p, i) => (
          <Body key={`intro-${i}`} style={styles.paragraph}>
            {p}
          </Body>
        ))}

        {doc.sections.map((section, i) => (
          <View key={section.heading ?? `section-${i}`} style={styles.section}>
            {section.heading ? (
              <Label style={styles.heading}>{section.heading}</Label>
            ) : null}
            {section.paragraphs?.map((p, pi) => (
              <Body key={`p-${i}-${pi}`} style={styles.paragraph}>
                {p}
              </Body>
            ))}
            {section.bullets?.map((b, bi) => (
              <View key={`b-${i}-${bi}`} style={styles.bulletRow}>
                <Body style={styles.bulletMark}>•</Body>
                <Body style={styles.bulletText}>{b}</Body>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: space.lg, paddingBottom: 48 },
  title: { marginTop: space.md, marginBottom: 4 },
  updated: { marginBottom: space.lg },
  section: { marginBottom: space.md },
  heading: {
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8,
    color: colors.foreground,
  },
  paragraph: {
    marginBottom: 10,
    color: colors.foreground,
    lineHeight: 22,
  },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 6, paddingRight: 8 },
  bulletMark: { color: colors.foreground, lineHeight: 22 },
  bulletText: { flex: 1, color: colors.foreground, lineHeight: 22 },
});
