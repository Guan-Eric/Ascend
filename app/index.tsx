/ app/index.tsx - Entry point that checks auth state
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../config/firebase";
import Purchases from "react-native-purchases";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        await Purchases.logIn(user.uid);
        const customerInfo = await Purchases.getCustomerInfo();

        if (customerInfo.entitlements.active["pro"]) {
          router.replace("/(tabs)/(home)");
        } else {
          router.replace("/(onboarding)/paywall");
        }
      } else {
        // No user signed in
        router.replace("/(onboarding)/signin");
      }
    });

    return () => unsubscribe();
  };

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
      <Text className="text-primary text-2xl font-bold">Loading...</Text>
    </View>
  );
}