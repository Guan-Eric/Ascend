// app/(onboarding)/paywall.tsx
import { View, Text, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import { signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import * as backend from "../../backend";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../utils/theme";

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const primaryColor = useThemeColor('primary');
  // Get user settings from params
  const level = (params.level as "beginner" | "intermediate" | "advanced") || "beginner";
  const trainingDays = parseInt(params.trainingDays as string) || 3;
  const goalType = (params.goalType as "skill" | "strength") || "strength";
  const primaryGoalId = (params.primaryGoalId as string) || "push_strength";

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const userCredential = await signInAnonymously(FIREBASE_AUTH);
      const user = userCredential.user;

      // Initialize user with onboarding settings
      await backend.initializeUser(user.uid, {
        email: "",
        goalType,
        primaryGoalId,
        level,
        trainingDaysPerWeek: trainingDays,
      });

      await Purchases.logIn(user.uid);

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
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

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
        Alert.alert("No Purchases Found", "You don't have any active subscriptions.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Restore Failed", "Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
        <Text className="text-primary text-2xl font-bold">Loading...</Text>
      </View>
    );
  }

  return (
    <FlashList
      className="flex-1 bg-background"
      data={[0]}
      renderItem={() => (
        <View className="px-8 pt-16 pb-8">
          <View className="bg-primary w-24 h-24 rounded-full items-center justify-center mb-6 shadow-elevated-lg mx-auto">
            <Text className="text-6xl">🚀</Text>
          </View>

          <Text className="text-primary text-5xl font-bold mb-3 text-center">
            Unlock Ascend
          </Text>
          <Text className="text-text-primary text-2xl font-semibold mb-3 text-center">
            Start Your Journey
          </Text>
          <Text className="text-text-secondary text-center text-lg mb-8 leading-6">
            Get unlimited access to all features and transform your body with calisthenics
          </Text>

          <View className="mb-8">
            <FeatureItem
              icon="dumbbell"
              title="Unlimited Workouts"
              description="Access all training programs and routines"
              primaryColor={primaryColor}
            />
            <FeatureItem
              icon="medal-outline"
              title="Skill Progressions"
              description="Master advanced moves with step-by-step guidance"
              primaryColor={primaryColor}
            />
            <FeatureItem
              icon="brain"
              title="AI Coach"
              description="Get personalized feedback and recommendations"
              primaryColor={primaryColor}
            />
            <FeatureItem
              icon="chart-line"
              title="Progress Tracking"
              description="Monitor your improvements and achievements"
              primaryColor={primaryColor}
            />
          </View>

          {offerings?.availablePackages.map((pkg) => (
            <Pressable
              key={pkg.identifier}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing}
              className="card-frosted border-2 border-primary/30 p-6 rounded-3xl mb-4 shadow-elevated hover-scale"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-text-primary text-xl font-bold">
                  {pkg.product.title}
                </Text>
                {pkg.product.introPrice && (
                  <View className="bg-success px-3 py-1 rounded-full">
                    <Text className="text-background text-xs font-bold">
                      {pkg.product.introPrice.periodNumberOfUnits} DAYS FREE
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-primary text-2xl font-bold mb-1">
                {pkg.product.priceString}
              </Text>
              <Text className="text-text-secondary text-sm">
                {pkg.product.subscriptionPeriod}
              </Text>
            </Pressable>
          ))}

          <Pressable onPress={handleRestore} className="mt-4 mb-2 hover-scale">
            <Text className="text-text-secondary text-center font-medium underline-animated">
              Restore Purchases
            </Text>
          </Pressable>

          <Text className="text-text-muted text-xs text-center leading-5 mt-4">
            Subscription automatically renews unless auto-renew is turned off at
            least 24 hours before the end of the current period.
          </Text>
        </View>
      )}
    />
  );
}

function FeatureItem({
  icon,
  title,
  description,
  primaryColor
}: {
  icon: string;
  title: string;
  description: string;
  primaryColor: string;
}) {
  return (
    <View className="flex-row items-start mb-5">
      <View className="w-12 h-12 bg-primary rounded-2xl items-center justify-center mr-4">
        <MaterialCommunityIcons name={icon as any} size={24} color={primaryColor} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-lg font-semibold mb-1">
          {title}
        </Text>
        <Text className="text-text-secondary leading-5">{description}</Text>
      </View>
    </View>
  );
}