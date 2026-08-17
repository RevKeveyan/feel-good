import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type KeyboardEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/src/theme";

type KeyboardScreenProps = {
  children: ReactNode;
  background?: ReactNode;
  /** Rendered outside the safe area so it can sit flush on top of the keyboard. */
  accessory?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function KeyboardScreen({
  children,
  background,
  accessory,
  contentContainerStyle,
  style,
  edges = ["top", "right", "bottom", "left"],
}: KeyboardScreenProps) {
  const insets = useSafeAreaInsets();
  const body = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      bounces={false}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {children}
    </ScrollView>
  );

  return (
    <View style={styles.flex}>
      <SafeAreaView style={[styles.root, style]} edges={edges}>
        {background}
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior="padding"
            keyboardVerticalOffset={insets.top}
          >
            {body}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.flex}>{body}</View>
        )}
      </SafeAreaView>
      {accessory}
    </View>
  );
}

type KeyboardAccessoryBarProps = {
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  primaryDisabled?: boolean;
};

const ACCESSORY_HEIGHT = 44;
const ANDROID_SHOW_DURATION = 120;

/**
 * Toolbar pinned to the top of the keyboard.
 *
 * Deliberately not `InputAccessoryView`: any prop update on a focused field carrying
 * `inputAccessoryViewID` makes RCTTextInputComponentView call `reloadInputViews`, which
 * reattaches the native bar and flashes on every keystroke.
 *
 * Positioned against the bottom of its parent, so it must be the last child of a screen's
 * full-screen root, outside both `SafeAreaView` and `KeyboardAvoidingView`. Nested in a
 * scroll view it would scroll away; nested in a bottom safe area it would float above the
 * keyboard by the inset.
 */
export function KeyboardAccessoryBar({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
}: KeyboardAccessoryBarProps) {
  const [visible, setVisible] = useState(false);
  const offset = useRef(new Animated.Value(0)).current;
  const handlerRef = useRef(onPrimaryPress);

  useEffect(() => {
    handlerRef.current = onPrimaryPress;
  });

  useEffect(() => {
    // Android resizes the window instead of overlaying it, so the bottom edge already
    // sits above the keyboard and no translation is needed.
    const translates = Platform.OS === "ios";
    let mounted = true;

    const show = (event: KeyboardEvent) => {
      setVisible(true);
      Animated.timing(offset, {
        toValue: translates ? -event.endCoordinates.height : 0,
        duration: event.duration || ANDROID_SHOW_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const hide = (event: KeyboardEvent) => {
      Animated.timing(offset, {
        toValue: 0,
        duration: event.duration || ANDROID_SHOW_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) setVisible(false);
      });
    };

    const showEvent = translates ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = translates ? "keyboardWillHide" : "keyboardDidHide";
    const subscriptions = [
      Keyboard.addListener(showEvent, show),
      Keyboard.addListener(hideEvent, hide),
    ];

    return () => {
      mounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [offset]);

  const handlePrimaryPress = useCallback(() => {
    Keyboard.dismiss();
    handlerRef.current?.();
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.accessory, { transform: [{ translateY: offset }] }]}>
      <Pressable
        onPress={Keyboard.dismiss}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Dismiss keyboard"
      >
        <Text style={styles.accessoryDone}>Done</Text>
      </Pressable>
      {primaryLabel && onPrimaryPress ? (
        <Pressable
          onPress={handlePrimaryPress}
          disabled={primaryDisabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
        >
          <Text
            style={[
              styles.accessoryPrimary,
              primaryDisabled ? styles.accessoryPrimaryDisabled : null,
            ]}
          >
            {primaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  accessory: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: ACCESSORY_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  accessoryDone: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.mutedForeground,
  },
  accessoryPrimary: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.foreground,
  },
  accessoryPrimaryDisabled: {
    opacity: 0.4,
  },
});
