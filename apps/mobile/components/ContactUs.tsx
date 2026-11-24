import { Linking, StyleSheet, View } from "react-native";
import { contactSupportMailto, contactWhatsAppUrl } from "@feelgood/shared";
import { Body, DarkButton, Kicker, OutlineButton, WhatsAppGlyph } from "@/components/ui";
import { borders, colors, iconSizes, radius, space, typeScale } from "@/src/theme";

type Props = {
  unisex?: boolean;
};

export function ContactUs(_props: Props = {}) {
  return (
    <View style={styles.wrap}>
      <Kicker style={styles.kicker}>Here to help</Kicker>
      <Body style={styles.body}>
        Have a question, feeling stuck or have a win to share? We&apos;d love to hear from you.
      </Body>
      <DarkButton
        label="Message us"
        onPress={() => void Linking.openURL(contactWhatsAppUrl())}
        leadingIcon={<WhatsAppGlyph size={iconSizes.sm} color={colors.background} />}
        style={styles.btn}
      />
      <OutlineButton
        label="Email us"
        onPress={() => void Linking.openURL(contactSupportMailto())}
        style={styles.emailBtn}
      />
      <Body size="sm" style={styles.footer}>
        We reply between 9am and 5pm AEST, usually within 12-24 hours.
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["3xl"],
    borderWidth: borders.hairline,
    borderColor: colors.ringHairline,
    backgroundColor: colors.card,
    padding: space.p6,
    marginTop: space["2xl"],
    alignItems: "center",
  },
  kicker: {
    color: colors.mutedForeground,
    textAlign: "center",
  },
  body: {
    marginTop: space.md,
    marginBottom: space.lg,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  btn: {
    marginBottom: space.md,
    alignSelf: "stretch",
  },
  emailBtn: {
    marginBottom: space.sm,
    alignSelf: "stretch",
    borderColor: colors.border,
  },
  footer: {
    marginTop: space.md,
    color: colors.mutedForeground,
    textAlign: "center",
    fontSize: typeScale.meta.fontSize,
    lineHeight: typeScale.meta.lineHeight,
  },
});
