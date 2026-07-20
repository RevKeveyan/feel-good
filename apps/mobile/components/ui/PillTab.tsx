import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "@/src/theme";

type Props = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

export function PillTab({ tabs, active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.full,
  },
  tabActive: { backgroundColor: colors.primary },
  text: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.foreground,
  },
  textActive: { color: colors.primaryForeground },
});
