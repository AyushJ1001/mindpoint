import { Alert, Platform } from "react-native";

function fallbackToast(title: string, message?: string) {
  if (Platform.OS === "web") {
    console.warn(message ? `${title}: ${message}` : title);
    return;
  }

  Alert.alert(title, message);
}

export function showToast(title: string, message?: string) {
  fallbackToast(title, message);
}

export function showErrorToast(title: string, message?: string) {
  fallbackToast(title, message);
}
