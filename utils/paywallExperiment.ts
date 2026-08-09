import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInAnonymously } from "firebase/auth";
import Purchases from "react-native-purchases";
import { FIREBASE_AUTH } from "../config/firebase";
import * as backend from "../backend";
import { logEvent } from "./analytics";
import { setRevenueCatCustomerAttributes } from "./revenuecatAttributes";

const VARIANT_KEY = "@ascend_ab_paywall_variant";

export type PaywallVariant = "control" | "freemium";

/** Assign once per install; 50/50 split between hard paywall and 1 free workout. */
export async function getPaywallVariant(): Promise<PaywallVariant> {
  const stored = await AsyncStorage.getItem(VARIANT_KEY);
  if (stored === "control" || stored === "freemium") {
    return stored;
  }

  const variant: PaywallVariant = Math.random() < 0.5 ? "freemium" : "control";
  await AsyncStorage.setItem(VARIANT_KEY, variant);
  logEvent("paywall_variant_assigned", { variant });
  return variant;
}

/** Freemium users may use Home once before subscribing. */
export async function canAccessAppWithoutSubscription(
  totalWorkouts: number
): Promise<boolean> {
  const variant = await getPaywallVariant();
  return variant === "freemium" && totalWorkouts === 0;
}

export async function completeFreemiumOnboarding(params: {
  level: "beginner" | "intermediate" | "advanced";
  trainingDays: number;
  goalType: "skill" | "strength";
  primaryGoalId: string;
}): Promise<{ planCount: number }> {
  let user = FIREBASE_AUTH.currentUser;
  if (!user) {
    const credential = await signInAnonymously(FIREBASE_AUTH);
    user = credential.user;
  }

  const existingUser = await backend.getUser(user.uid);

  if (!existingUser) {
    await backend.initializeUser(user.uid, {
      email: user.email ?? "",
      goalType: params.goalType,
      primaryGoalId: params.primaryGoalId,
      level: params.level,
      trainingDaysPerWeek: params.trainingDays,
    });
  }

  await Purchases.logIn(user.uid);

  await setRevenueCatCustomerAttributes({
    goalType: params.goalType,
    primaryGoalId: params.primaryGoalId,
    level: params.level,
    trainingDays: params.trainingDays,
  });

  const planIds = await backend.generateInitialPlans(user.uid);
  return { planCount: planIds.length };
}
