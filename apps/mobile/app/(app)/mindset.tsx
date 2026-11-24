import { Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "@/components/ui/icons";
import { MindsetLibrary } from "@/components/MindsetLibrary";
import { IconLabel, Kicker, Screen } from "@/components/ui";
import { colors, iconSizes, space } from "@/src/theme";

export default function MindsetScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <IconLabel
            gap={6}
            icon={<ArrowLeft size={iconSizes.xs} color={colors.mutedForeground} strokeWidth={2} />}
          >
            <Kicker>Back to today</Kicker>
          </IconLabel>
        </Pressable>
        <MindsetLibrary />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 40, paddingBottom: 40, gap: space["2xl"] },
});
