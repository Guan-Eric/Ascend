import { Stack } from "expo-router";
import { useEffect } from "react";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    // Initialize RevenueCat
    const initializeRevenueCat = async () => {
      try {
        if (Platform.OS === "ios") {
          await Purchases.configure({ apiKey: "YOUR_IOS_API_KEY" });
        } else if (Platform.OS === "android") {
          await Purchases.configure({ apiKey: "YOUR_ANDROID_API_KEY" });
        }
      } catch (error) {
        console.error("RevenueCat initialization error:", error);
      }
    };

    initializeRevenueCat();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
