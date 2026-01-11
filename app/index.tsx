import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "../config/firebase";
import Purchases from "react-native-purchases";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
        if (!user) {
          // No user, send to onboarding
          router.replace("/(onboarding)/step1");
          return;
        }

        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const hasProAccess =
            customerInfo.entitlements.active["pro"] !== undefined;

          if (hasProAccess) {
            // Has subscription, send to main app
            router.replace("/(tabs)/(home)");
          } else {
            // No subscription, send to paywall
            router.replace("/(tabs)/(home)");
          }
        } catch (error) {
          console.error("Error checking entitlement:", error);
          // On error, send to onboarding to be safe
          router.replace("/(onboarding)/step1");
        }
      });

      return unsubscribe;
    };

    checkAuthAndSubscription();
  }, []);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <ActivityIndicator size="large" color="primary" />
    </View>
  );
}
