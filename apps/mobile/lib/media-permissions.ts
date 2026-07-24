import { Alert, Linking } from "react-native";

export function alertMediaPermissionNeeded(message: string) {
  Alert.alert("Permission needed", message, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Open Settings",
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
}
