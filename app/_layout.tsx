import { Stack } from "expo-router";
import { useEffect } from "react";
import Purchases from "react-native-purchases";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Uniwind, useUniwind } from "uniwind";
import { logAppOpen } from "../utils/analytics";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

const THEME_STORAGE_KEY = "@ascend_theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const { theme } = useUniwind();

  const initializeRevenueCat = async () => {
    try {
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
      // Wave A: only light | dark. Migrate legacy theme names → light.
      if (savedTheme === "dark") {
        Uniwind.setTheme("dark");
      } else {
        Uniwind.setTheme("light");
        if (savedTheme && savedTheme !== "light") {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, "light");
        }
      }
    } catch (error) {
      console.error("Error loading saved theme:", error);
      Uniwind.setTheme("light");
    }
  };

  useEffect(() => {
    loadSavedTheme();
    initializeRevenueCat();
    logAppOpen();
  }, []);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
