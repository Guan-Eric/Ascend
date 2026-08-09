import Purchases from "react-native-purchases";
import { PRO_ENTITLEMENT_ID } from "../constants/revenuecat";
import { getWorkoutHistoryStats } from "../backend/workoutHistory";
import { canAccessAppWithoutSubscription } from "./paywallExperiment";

type RouterLike = {
  replace: (href: "/(tabs)/(home)" | "/(onboarding)/paywall") => void;
};

/** Route to Home, freemium Home, or paywall based on subscription state. */
export async function routeBySubscriptionStatus(
  router: RouterLike,
  userId: string
): Promise<void> {
  const customerInfo = await Purchases.getCustomerInfo();

  if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
    router.replace("/(tabs)/(home)");
    return;
  }

  const stats = await getWorkoutHistoryStats(userId);
  if (await canAccessAppWithoutSubscription(stats.totalWorkouts)) {
    router.replace("/(tabs)/(home)");
    return;
  }

  router.replace("/(onboarding)/paywall");
}
