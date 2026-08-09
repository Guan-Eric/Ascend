import { Stack } from "expo-router";
import { useEffect } from "react";
import Purchases from "react-native-purchases";
import { Platform } from "react-native";
import "../global.css";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Uniwind } from "uniwind";
import { logAppOpen } from "../utils/analytics";

const THEME_STORAGE_KEY = '@ascend_theme';

export default function RootLayout() {
  // Initialize RevenueCat
  const initializeRevenueCat = async () => {
    try {
      // iOS-only for now — skip RevenueCat on other platforms
      if (Platform.OS !== "ios") return;

      await Purchases.configure({
        apiKey: Constants.expoConfig?.extra?.revenuecatApiKey,
      });
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
    }
  };

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        Uniwind.setTheme(savedTheme as any);
      } else {
        // New installs land on the Ascend brand theme by default
        Uniwind.setTheme("ascend" as any);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  useEffect(() => {
    loadSavedTheme();
    initializeRevenueCat();
    logAppOpen();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
