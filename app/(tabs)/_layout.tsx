import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import Purchases from "react-native-purchases";

export default function TabsLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        if (!hasProAccess) {
          // No subscription, send to paywall
          router.replace("/(onboarding)/paywall");
        }
      } catch (error) {
        console.error("Error checking entitlement:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#000000", borderTopColor: "#27272a" },
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#71717a",
      }}
    >
      <Tabs.Screen name="(home)" options={{ title: "Home" }} />
      <Tabs.Screen name="(skills)" options={{ title: "Skills" }} />
      <Tabs.Screen name="(strength)" options={{ title: "Strength" }} />
      <Tabs.Screen name="(ai)" options={{ title: "AI Coach" }} />
      <Tabs.Screen name="(profile)" options={{ title: "Profile" }} />
    </Tabs>
  );
}
