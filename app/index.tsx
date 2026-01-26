// app/index.tsx - Entry point that checks auth state
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../config/firebase";
import Purchases from "react-native-purchases";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getUser } from "../backend";

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

        // Check if user has completed onboarding
        const userData = await getUser(user.uid);

        if (!userData) {
          // User exists in auth but not in database - needs onboarding
          router.replace("/(onboarding)/step1");
          return;
        }

        // User has completed onboarding, check subscription
        const customerInfo = await Purchases.getCustomerInfo();

        if (customerInfo.entitlements.active["Ascend Pro"]) {
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
      <LoadingSpinner size={64} />
      <Text className="text-primary text-2xl font-bold mt-4">Loading...</Text>
    </View>
  );
}