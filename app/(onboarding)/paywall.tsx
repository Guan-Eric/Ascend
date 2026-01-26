// app/(onboarding)/paywall.tsx - Enhanced Premium Paywall
import { View, Text, Alert, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Purchases, { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import * as backend from "../../backend";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../utils/theme";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { LinearGradient } from "expo-linear-gradient";

const premiumFeatures = [
  {
    icon: "dumbbell",
    title: "Unlimited Workouts",
    description: "Access all training programs and routines",
  },
  {
    icon: "medal-outline",
    title: "Skill Progressions",
    description: "Master advanced moves with step-by-step guidance",
  },
  {
    icon: "brain",
    title: "AI Coach",
    description: "Get personalized feedback and recommendations",
  },
  {
    icon: "chart-line",
    title: "Progress Tracking",
    description: "Monitor your improvements and achievements",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("$rc_weekly");
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
        // Default to annual
        setSelectedPackage("$rc_weekly");
      }
    } catch (error) {
      console.error("Error initializing user:", error);
      Alert.alert("Error", "Failed to initialize. Please restart the app.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!offerings) return;

    setPurchasing(true);
    try {
      const pkg = offerings.availablePackages.find(
        (p) => p.identifier === selectedPackage
      );

      if (!pkg) {
        Alert.alert("Error", "Selected plan not found.");
        setPurchasing(false);
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);

      if (customerInfo.entitlements.active["Ascend Pro"]) {
        Alert.alert("Success! 🎉", "Welcome to Ascend Pro!", [
          {
            text: "Let's Go!",
            onPress: () => router.replace("/(tabs)/(home)"),
          },
        ]);
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

      if (customerInfo.entitlements.active["Ascend Pro"]) {
        router.replace("/(tabs)/(home)");
      } else {
        Alert.alert("No Purchases Found", "You don't have any active subscriptions.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Restore Failed", "Please try again.");
    }
  };

  const getPackageDetails = (pkg: PurchasesPackage) => {
    const isWeekly = pkg.identifier === "$rc_weekly";
    const isAnnual = pkg.identifier === "$rc_annual";

    if (isWeekly) {
      return {
        name: "Weekly",
        badge: "3-DAY FREE TRIAL",
        description: "Try free for 3 days",
        savings: null,
        perMonth: null,
      };
    }

    if (isAnnual) {
      const annualPrice = pkg.product.price || 0;
      const weeklyPkg = offerings?.availablePackages.find(
        (p) => p.identifier === "$rc_weekly"
      );
      const weeklyPrice = weeklyPkg?.product.price || 0;

      const annualizedWeekly = weeklyPrice * 52;
      const savingsAmount = annualizedWeekly - annualPrice;
      const percentOff =
        annualizedWeekly > 0
          ? Math.round((savingsAmount / annualizedWeekly) * 100)
          : 0;

      const perMonth = annualPrice / 12;

      return {
        name: "Annual",
        badge: percentOff > 0 ? `BEST VALUE - Save ${percentOff}%` : "BEST VALUE",
        description: "Best value • Cancel anytime",
        savings: weeklyPrice > 0 ? `Save vs weekly` : null,
        perMonth: annualPrice > 0 ? `Just $${perMonth.toFixed(2)}/month` : null,
      };
    }

    return {
      name: pkg.product.title,
      badge: null,
      description: "Cancel anytime",
      savings: null,
      perMonth: null,
    };
  };

  const renderPricingCards = () => {
    if (!offerings) return null;

    const sortedPackages = [...offerings.availablePackages].sort((a, b) => {
      if (a.identifier === "$rc_annual") return -1;
      if (b.identifier === "$rc_annual") return 1;
      return 0;
    });

    return sortedPackages.map((pkg) => {
      const isSelected = selectedPackage === pkg.identifier;
      const details = getPackageDetails(pkg);

      return (
        <AnimatedPressable
          key={pkg.identifier}
          onPress={() => setSelectedPackage(pkg.identifier)}
          className={`mb-4 rounded-3xl border-2 p-6 ${isSelected
            ? "border-primary bg-primary/10"
            : "border-border bg-surface"
            }`}
        >
          {details.badge && (
            <View className="absolute -top-2 right-4 bg-success rounded-full px-3 py-1">
              <Text className="text-background text-xs font-bold">
                {details.badge}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text
                className={`text-xl font-bold mb-1 ${isSelected ? "text-primary" : "text-text-primary"
                  }`}
              >
                {details.name}
              </Text>

              <Text className="text-sm text-text-secondary mb-2">
                {details.description}
              </Text>

              <View className="flex-row items-baseline mb-2">
                <Text
                  className={`text-3xl font-bold ${isSelected ? "text-primary" : "text-text-primary"
                    }`}
                >
                  {pkg.product.priceString}
                </Text>
                <Text className="text-sm text-text-secondary ml-2">
                  /{pkg.identifier === "$rc_annual" ? "year" : "week"}
                </Text>
              </View>

              {details.perMonth && (
                <View className="bg-surface-elevated rounded-lg px-3 py-1.5 mb-2">
                  <Text className="text-xs text-text-secondary text-center">
                    {details.perMonth}
                  </Text>
                </View>
              )}

              {details.savings && (
                <Text className="text-success text-sm font-semibold">
                  {details.savings}
                </Text>
              )}
            </View>

            <View
              className={`w-7 h-7 rounded-full border-2 items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"
                }`}
            >
              {isSelected && (
                <View className="w-3.5 h-3.5 rounded-full bg-background" />
              )}
            </View>
          </View>
        </AnimatedPressable>
      );
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
        <Text className="text-primary text-2xl font-bold mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        <View className="px-8 pt-16">
          {/* Hero */}
          <View className="items-center mb-8">
            <View className="bg-primary/20 rounded-full p-6 mb-4">
              <MaterialCommunityIcons
                name="arm-flex"
                size={64}
                color={primaryColor}
              />
            </View>
            <Text className="text-primary text-5xl font-bold text-center mb-3">
              Unlock Ascend
            </Text>
            <Text className="text-text-primary text-2xl font-semibold text-center mb-3">
              Start Your Journey
            </Text>
            <Text className="text-text-secondary text-center text-lg px-4 leading-6">
              Get unlimited access to all features and transform your body with calisthenics
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            {premiumFeatures.map((feature, index) => (
              <View key={index} className="mb-5 flex-row items-start">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={24}
                    color={primaryColor}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-lg font-bold text-text-primary">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-text-secondary leading-5">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <Text className="text-text-primary text-2xl font-bold mb-4">
            Choose Your Plan
          </Text>

          {renderPricingCards()}

          {/* Social Proof */}
          <View className="bg-success/10 border border-success/30 rounded-3xl p-5 mb-4">
            <View className="flex-row items-center justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialCommunityIcons
                  key={star}
                  name="star"
                  size={20}
                  color={primaryColor}
                />
              ))}
            </View>
            <Text className="text-center text-sm font-bold text-success mb-2">
              "Best investment in my fitness journey!"
            </Text>
            <Text className="text-center text-xs text-text-secondary">
              Join thousands of members transforming their bodies
            </Text>
          </View>

          {/* Trust Badges */}
          <View className="flex-row justify-center items-center mb-4 flex-wrap">
            <View className="flex-row items-center mx-3 my-1">
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color="#10b981"
              />
              <Text className="text-text-secondary text-xs ml-1">Secure</Text>
            </View>
            <View className="flex-row items-center mx-3 my-1">
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color="#10b981"
              />
              <Text className="text-text-secondary text-xs ml-1">
                Cancel Anytime
              </Text>
            </View>
          </View>

          {/* Legal Text */}
          <View className="mt-6 px-2">
            <Text className="text-text-muted text-[11px] leading-4 text-center">
              Auto-renewable subscription. Payment will be charged to your
              Apple ID account at confirmation of purchase. The subscription
              automatically renews unless auto-renew is turned off at least 24
              hours before the end of the current period. Your account will be
              charged for renewal 24 hours prior to the end of the current
              period.
              {"\n\n"}You can manage or cancel your subscription at any time
              in your App Store account settings after purchase. Free trial
              will convert to a paid subscription unless cancelled at least 24
              hours before the trial ends.
            </Text>
            <View className="flex-row items-center justify-center gap-4 mt-4">
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                  )
                }
              >
                <Text className="text-primary text-sm">Terms of Use</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://yourwebsite.com/privacy")
                }
              >
                <Text className="text-primary text-sm">Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA Footer */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-8 pb-8 pt-4">
        <AnimatedPressable
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage || loading}
          className={`overflow-hidden rounded-2xl shadow-elevated-lg ${purchasing || !selectedPackage || loading ? "opacity-50" : ""
            }`}
        >
          <LinearGradient
            colors={[primaryColor, primaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 20 }}
          >
            {purchasing ? (
              <View className="items-center">
                <LoadingSpinner size={24} />
              </View>
            ) : (
              <Text className="text-center text-lg font-bold text-background">
                {selectedPackage === "$rc_weekly"
                  ? "Start Free Trial"
                  : "Start Annual Plan"}
              </Text>
            )}
          </LinearGradient>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleRestore}
          disabled={purchasing}
          className="items-center py-3 mt-2"
        >
          <Text className="text-text-secondary font-semibold underline">
            Restore Purchases
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}