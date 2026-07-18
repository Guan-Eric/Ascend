import Purchases from "react-native-purchases";
import { User } from "../types/User";
import { PRO_ENTITLEMENT_ID } from "../constants/revenuecat";

export type AppAccess =
  | { kind: "pro" }
  | { kind: "sample"; user: User }
  | { kind: "paywall"; reason: "sample_completed" | "no_sample" };

/**
 * Resolve where a signed-in, onboarded user should go.
 * Non-Pro users may access Home for one free sample workout until it's completed.
 */
export async function resolveAppAccess(user: User): Promise<AppAccess> {
  const customerInfo = await Purchases.getCustomerInfo();
  if (customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
    return { kind: "pro" };
  }

  if (user.sampleWorkoutCompleted) {
    return { kind: "paywall", reason: "sample_completed" };
  }

  if (user.samplePlanId) {
    return { kind: "sample", user };
  }

  return { kind: "paywall", reason: "no_sample" };
}

export function paywallHref(params?: {
  source?: string;
  level?: string;
  trainingDays?: number | string;
  goalType?: string;
  primaryGoalId?: string;
}) {
  return {
    pathname: "/(onboarding)/paywall" as const,
    params: {
      source: params?.source ?? "returning",
      ...(params?.level ? { level: params.level } : {}),
      ...(params?.trainingDays !== undefined
        ? { trainingDays: String(params.trainingDays) }
        : {}),
      ...(params?.goalType ? { goalType: params.goalType } : {}),
      ...(params?.primaryGoalId ? { primaryGoalId: params.primaryGoalId } : {}),
    },
  };
}
