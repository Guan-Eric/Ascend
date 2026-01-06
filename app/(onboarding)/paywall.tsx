import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../config/firebase";

export default function PaywallScreen() {
  const router = useRouter();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(FIREBASE_AUTH);
      const user = userCredential.user;

      // Create Firestore user document
      await setDoc(
        doc(FIRESTORE_DB, "users", user.uid),
        {
          createdAt: new Date().toISOString(),
          isAnonymous: true,
        },
        { merge: true }
      );

      // Identify user in RevenueCat
      await Purchases.logIn(user.uid);

      // Load offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
      Alert.alert("Error", "Failed to initialize. Please restart the app.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: any) => {
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );

      if (customerInfo.entitlements.active["pro"]) {
        router.replace("/(tabs)/(home)");
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
        Alert.alert("Purchase Failed", "Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["pro"]) {
        router.replace("/(tabs)/(home)");
      } else {
        Alert.alert(
          "No Purchases Found",
          "You don't have any active subscriptions."
        );
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Restore Failed", "Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-orange-500 text-2xl font-bold">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-8 pt-16 pb-8">
        {/* Header */}
        <Text className="text-orange-500 text-5xl font-bold mb-2">
          Unlock Ascend
        </Text>
        <Text className="text-white text-2xl font-semibold mb-3">
          Start Your Journey
        </Text>
        <Text className="text-zinc-400 text-lg mb-8 leading-6">
          Get unlimited access to all features and transform your body with
          calisthenics
        </Text>

        {/* Features */}
        <View className="mb-8">
          <FeatureItem
            icon="✓"
            title="Unlimited Workouts"
            description="Access all training programs and routines"
          />
          <FeatureItem
            icon="✓"
            title="Skill Progressions"
            description="Master advanced moves with step-by-step guidance"
          />
          <FeatureItem
            icon="✓"
            title="AI Coach"
            description="Get personalized feedback and recommendations"
          />
          <FeatureItem
            icon="✓"
            title="Progress Tracking"
            description="Monitor your improvements and achievements"
          />
        </View>

        {/* Subscription Options */}
        {offerings?.availablePackages.map((pkg) => (
          <Pressable
            key={pkg.identifier}
            onPress={() => handlePurchase(pkg)}
            disabled={purchasing}
            className="bg-zinc-900 border-2 border-orange-500 p-6 rounded-xl mb-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-xl font-bold">
                {pkg.product.title}
              </Text>
              {pkg.product.introPrice && (
                <View className="bg-orange-500 px-3 py-1 rounded-full">
                  <Text className="text-black text-xs font-bold">
                    {pkg.product.introPrice.periodNumberOfUnits} DAYS FREE
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-orange-500 text-2xl font-bold mb-1">
              {pkg.product.priceString}
            </Text>
            <Text className="text-zinc-400 text-sm">
              {pkg.product.subscriptionPeriod}
            </Text>
          </Pressable>
        ))}

        {/* Restore & Terms */}
        <Pressable onPress={handleRestore} className="mt-4 mb-2">
          <Text className="text-zinc-400 text-center font-medium">
            Restore Purchases
          </Text>
        </Pressable>

        <Text className="text-zinc-600 text-xs text-center leading-5">
          Subscription automatically renews unless auto-renew is turned off at
          least 24 hours before the end of the current period.
        </Text>
      </View>
    </ScrollView>
  );
}

// Feature Item Component
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start mb-4">
      <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-4">
        <Text className="text-black text-lg font-bold">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white text-lg font-semibold mb-1">{title}</Text>
        <Text className="text-zinc-400 leading-5">{description}</Text>
      </View>
    </View>
  );
}
