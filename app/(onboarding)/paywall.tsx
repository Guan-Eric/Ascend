// app/(onboarding)/paywall.tsx — Wave A: narrative + 3 bullets + packages
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import * as backend from "../../backend";
import { PRO_ENTITLEMENT_ID } from "../../constants/revenuecat";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
  logPaywallViewed,
  logTrialStarted,
  logSubscriptionStarted,
  logPurchaseFailed,
  logPlansGenerated,
  logPaywallPurchaseTapped,
} from "../../utils/analytics";
import { setRevenueCatCustomerAttributes } from "../../utils/revenuecatAttributes";
import { Screen, Button } from "../../components/ui";
import { FadeSlideIn } from "../../components/FadeSlideIn";

const bullets = [
  "AI plan built for your goal and days",
  "Auto-adapt when life gets in the way",
  "Check-ins, deloads, and injury pause",
];

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("$rc_weekly");
  const [goalName, setGoalName] = useState<string>("");

  const level =
    (params.level as "beginner" | "intermediate" | "advanced") || "beginner";
  const trainingDays = parseInt(params.trainingDays as string) || 3;
  const goalType = (params.goalType as "skill" | "strength") || "strength";
  const primaryGoalId =
    (params.primaryGoalId as string) || "push_strength";
  const paywallSource =
    (params.source as string) ||
    (params.level && params.trainingDays ? "onboarding" : "returning");

  const hasOnboardingParams = Boolean(params.level && params.trainingDays);
  const fromSampleWorkout = paywallSource === "sample_workout";

  useEffect(() => {
    initializeUser();
  }, []);

  const loadGoalName = async () => {
    try {
      if (goalType === "skill") {
        const skill = await backend.getSkill(primaryGoalId);
        if (skill) setGoalName(skill.name);
      } else {
        const path = await backend.getStrengthPath(primaryGoalId);
        if (path) setGoalName(path.name);
      }
    } catch (error) {
      console.error("Error loading goal name:", error);
    }
  };

  const initializeUser = async () => {
    try {
      let user = FIREBASE_AUTH.currentUser;
      if (!user) {
        const userCredential = await signInAnonymously(FIREBASE_AUTH);
        user = userCredential.user;
      }

      const existingUser = await backend.getUser(user.uid);

      if (!existingUser && hasOnboardingParams) {
        await backend.initializeUser(user.uid, {
          email: user.email ?? "",
          goalType,
          primaryGoalId,
          level,
          trainingDaysPerWeek: trainingDays,
        });
      }

      const profileGoalType = existingUser?.goalType ?? goalType;
      const profileGoalId = existingUser?.primaryGoalId ?? primaryGoalId;
      if (existingUser) {
        try {
          if (profileGoalType === "skill") {
            const skill = await backend.getSkill(profileGoalId);
            if (skill) setGoalName(skill.name);
          } else {
            const path = await backend.getStrengthPath(profileGoalId);
            if (path) setGoalName(path.name);
          }
        } catch {
          await loadGoalName();
        }
      } else {
        await loadGoalName();
      }

      await Purchases.logIn(user.uid);

      if (hasOnboardingParams || existingUser) {
        await setRevenueCatCustomerAttributes({
          goalType: existingUser?.goalType ?? goalType,
          primaryGoalId: existingUser?.primaryGoalId ?? primaryGoalId,
          level: existingUser?.level ?? level,
          trainingDays: existingUser?.trainingDaysPerWeek ?? trainingDays,
        });
      }

      const nextOfferings = await Purchases.getOfferings();
      if (nextOfferings.current) {
        setOfferings(nextOfferings.current);
        setSelectedPackage("$rc_weekly");
        logPaywallViewed({ source: paywallSource });
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
    logPaywallPurchaseTapped({ packageId: selectedPackage });

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

      if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
        const entitlement =
          customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
        if (entitlement.periodType === "TRIAL") {
          logTrialStarted({ packageId: pkg.identifier });
        } else {
          logSubscriptionStarted({ packageId: pkg.identifier });
        }

        await setRevenueCatCustomerAttributes({
          goalType,
          primaryGoalId,
          level,
          trainingDays,
        });

        const userId = FIREBASE_AUTH.currentUser?.uid;
        let planCount = 0;
        const profile = userId ? await backend.getUser(userId) : null;
        const attrsGoalType = profile?.goalType ?? goalType;
        const attrsGoalId = profile?.primaryGoalId ?? primaryGoalId;
        const attrsLevel = profile?.level ?? level;
        const attrsDays = profile?.trainingDaysPerWeek ?? trainingDays;

        try {
          await Purchases.setAttributes({
            goal_type: attrsGoalType,
            primary_goal_id: attrsGoalId,
            level: attrsLevel,
            training_days: String(attrsDays),
          });
        } catch (attrError) {
          console.error("Error setting RC attributes:", attrError);
        }

        if (userId) {
          try {
            const planIds = await backend.generateInitialPlans(userId);
            planCount = planIds.length;
            logPlansGenerated({ planCount, goalType: attrsGoalType });
          } catch (planError) {
            console.error("Error generating initial plans:", planError);
          }
        }

        const goalLabel = goalName || "program";
        Alert.alert(
          "Welcome to Ascend Pro",
          planCount > 0
            ? `Your ${trainingDays}-day ${goalLabel} plan is ready.`
            : "You're in.",
          [
            {
              text: "Start today",
              onPress: () => router.replace("/(tabs)/(home)"),
            },
          ]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
        logPurchaseFailed({
          packageId: selectedPackage,
          reason: error?.message,
        });
        Alert.alert("Purchase Failed", "Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
        const userId = FIREBASE_AUTH.currentUser?.uid;
        if (userId) {
          try {
            const profile = await backend.getUser(userId);
            if (profile) {
              await Purchases.setAttributes({
                goal_type: profile.goalType,
                primary_goal_id: profile.primaryGoalId,
                level: profile.level,
                training_days: String(profile.trainingDaysPerWeek),
              });
            }
            await backend.generateInitialPlans(userId);
          } catch (planError) {
            console.error("Error generating plans on restore:", planError);
          }
        }
        router.replace("/(tabs)/(home)");
      } else {
        Alert.alert(
          "No purchases found",
          "You don't have an active subscription."
        );
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
        badge: "3-day free trial",
        period: "week",
      };
    }

    if (isAnnual) {
      const annualPrice = pkg.product.price || 0;
      const weeklyPkg = offerings?.availablePackages.find(
        (p) => p.identifier === "$rc_weekly"
      );
      const weeklyPrice = weeklyPkg?.product.price || 0;
      const annualizedWeekly = weeklyPrice * 52;
      const percentOff =
        annualizedWeekly > 0
          ? Math.round(
              ((annualizedWeekly - annualPrice) / annualizedWeekly) * 100
            )
          : 0;

      return {
        name: "Yearly",
        badge: percentOff > 0 ? `Save ${percentOff}%` : "Best value",
        period: "year",
      };
    }

    return {
      name: pkg.product.title,
      badge: null,
      period: "",
    };
  };

  if (loading) {
    return (
      <Screen className="justify-center items-center" padded={false}>
        <LoadingSpinner size={56} />
      </Screen>
    );
  }

  const sortedPackages = offerings
    ? [...offerings.availablePackages].sort((a, b) => {
        if (a.identifier === "$rc_annual") return -1;
        if (b.identifier === "$rc_annual") return 1;
        return 0;
      })
    : [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180, paddingTop: 64 }}
      >
        <View className="px-6">
          <FadeSlideIn>
            <Text className="text-text-primary text-[32px] font-sans-semibold mb-3 leading-10">
              Your coach that adapts
            </Text>
            <Text className="text-text-muted text-[16px] font-sans leading-6 mb-8">
              {fromSampleWorkout
                ? goalName
                  ? `Unlock your full ${goalName} plan and keep adapting.`
                  : "Unlock your full plan and keep adapting."
                : goalName
                  ? `${goalName} · ${trainingDays} days a week — ready when you are.`
                  : "Personalized training that reshuffles with your week."}
            </Text>
          </FadeSlideIn>

          <FadeSlideIn delay={60}>
            <View className="mb-10">
              {bullets.map((line) => (
                <View key={line} className="flex-row items-start mb-4">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
                  <Text className="text-text-primary text-[15px] font-sans flex-1 leading-6">
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </FadeSlideIn>

          <FadeSlideIn delay={100}>
            <View className="mb-6">
              {sortedPackages.map((pkg) => {
                const isSelected = selectedPackage === pkg.identifier;
                const details = getPackageDetails(pkg);
                return (
                  <AnimatedPressable
                    key={pkg.identifier}
                    onPress={() => setSelectedPackage(pkg.identifier)}
                    className={`mb-3 rounded-xl border px-5 py-4 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text
                            className={`text-[17px] font-sans-semibold ${
                              isSelected
                                ? "text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            {details.name}
                          </Text>
                          {details.badge && (
                            <Text className="text-primary text-[12px] font-sans-medium">
                              {details.badge}
                            </Text>
                          )}
                        </View>
                        <Text className="text-text-muted text-[13px] font-sans">
                          {pkg.product.priceString}
                          {details.period ? ` / ${details.period}` : ""}
                        </Text>
                      </View>
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? "border-primary" : "border-border"
                        }`}
                      >
                        {isSelected && (
                          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </View>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </FadeSlideIn>

          <Text className="text-text-muted text-[11px] font-sans leading-4 text-center mb-4">
            Auto-renewable subscription. Charged to your Apple ID at purchase.
            Renews unless cancelled at least 24 hours before the period ends.
            Manage in App Store settings. Free trial converts unless cancelled
            24 hours before it ends.
          </Text>
          <View className="flex-row items-center justify-center gap-4 mb-4">
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
            >
              <Text className="text-primary text-[13px] font-sans-medium">
                Terms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.gym-pulse.fit/ascend")
              }
            >
              <Text className="text-primary text-[13px] font-sans-medium">
                Privacy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 pb-8 pt-4">
        <Button
          label={
            purchasing
              ? "Processing…"
              : `Continue — ${
                  offerings?.availablePackages.find(
                    (p) => p.identifier === selectedPackage
                  )?.product.priceString ?? ""
                }`
          }
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage || loading}
          className="mb-2"
        />
        <AnimatedPressable
          onPress={handleRestore}
          disabled={purchasing}
          className="items-center py-2"
        >
          <Text className="text-text-muted font-sans-medium text-[14px]">
            Restore purchases
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
