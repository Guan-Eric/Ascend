import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import Purchases from "react-native-purchases";

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // User is signed in, check entitlement
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const hasProAccess =
            customerInfo.entitlements.active["pro"] !== undefined;

          if (hasProAccess) {
            // User has subscription, go to tabs
            router.replace("/(tabs)/(home)");
          } else {
            // User needs to subscribe
            router.replace("/(tabs)/(home)"); // Tabs layout will handle paywall
          }
        } catch (error) {
          console.error("Error checking entitlement:", error);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
