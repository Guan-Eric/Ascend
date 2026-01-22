import { Stack } from "expo-router";
import { useEffect } from "react";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import "../global.css";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Uniwind } from "uniwind";

const THEME_STORAGE_KEY = '@ascend_theme';

export default function RootLayout() {
  // Initialize RevenueCat
  const initializeRevenueCat = async () => {
    try {
      if (Platform.OS === "ios") {
        await Purchases.configure({
          apiKey: Constants.expoConfig?.extra?.revenuecatApiKey,
        });
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: "YOUR_ANDROID_API_KEY" });
      }
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
    }
  };

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        Uniwind.setTheme(savedTheme as any);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  useEffect(() => {
    loadSavedTheme();
    initializeRevenueCat();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
