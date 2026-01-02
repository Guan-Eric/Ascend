import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import Purchases, { PurchasesOffering } from "react-native-purchases";

export default function TabsLayout() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/(auth)/welcome");
        return;
      }

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasProAccess =
          customerInfo.entitlements.active["pro"] !== undefined;

        setHasAccess(hasProAccess);

        if (!hasProAccess) {
          // Load offerings for paywall
          const offerings = await Purchases.getOfferings();
          if (offerings.current) {
            setOfferings(offerings.current);
          }
          setShowPaywall(true);
        }
      } catch (error) {
        console.error("Error checking entitlement:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handlePurchase = async (packageToPurchase: any) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );

      if (customerInfo.entitlements.active["pro"]) {
        setHasAccess(true);
        setShowPaywall(false);
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
      }
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["pro"]) {
        setHasAccess(true);
        setShowPaywall(false);
      }
    } catch (error) {
      console.error("Restore error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#0f172a" },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#64748b",
        }}
      >
        <Tabs.Screen name="(home)" options={{ title: "Home" }} />
        <Tabs.Screen name="(skills)" options={{ title: "Skills" }} />
        <Tabs.Screen name="(strength)" options={{ title: "Strength" }} />
        <Tabs.Screen name="(ai)" options={{ title: "AI Coach" }} />
        <Tabs.Screen name="(profile)" options={{ title: "Profile" }} />
      </Tabs>

      {/* Paywall Modal */}
      <Modal visible={showPaywall} animationType="slide">
        <View className="flex-1 bg-slate-900 px-8 pt-16">
          <Text className="text-white text-4xl font-bold mb-4">
            Start Your Free Trial
          </Text>
          <Text className="text-slate-300 text-lg mb-8">
            Get full access to Ascend and master calisthenics
          </Text>

          {offerings?.availablePackages.map((pkg) => (
            <Pressable
              key={pkg.identifier}
              onPress={() => handlePurchase(pkg)}
              className="bg-blue-600 py-4 rounded-lg mb-4"
            >
              <Text className="text-white text-center font-semibold text-lg">
                {pkg.product.title}
              </Text>
              <Text className="text-white text-center">
                {pkg.product.priceString}
              </Text>
              {pkg.product.introPrice && (
                <Text className="text-blue-200 text-center text-sm">
                  {pkg.product.introPrice.periodNumberOfUnits} day free trial
                </Text>
              )}
            </Pressable>
          ))}

          <Pressable onPress={handleRestore} className="mt-4">
            <Text className="text-slate-400 text-center">
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
