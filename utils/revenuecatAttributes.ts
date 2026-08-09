import Purchases from "react-native-purchases";

type CustomerAttributeInput = {
  goalType: "skill" | "strength";
  primaryGoalId: string;
  level: "beginner" | "intermediate" | "advanced";
  trainingDays: number;
};

/** Sync onboarding profile to RevenueCat for cohort analytics. */
export async function setRevenueCatCustomerAttributes(
  attrs: CustomerAttributeInput
): Promise<void> {
  try {
    await Purchases.setAttributes({
      goal_type: attrs.goalType,
      primary_goal_id: attrs.primaryGoalId,
      level: attrs.level,
      training_days: String(attrs.trainingDays),
    });
  } catch (error) {
    console.error("Error setting RevenueCat attributes:", error);
  }
}
