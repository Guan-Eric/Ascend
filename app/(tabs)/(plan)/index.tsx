import { View, Text } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { User } from "../../../types/User";
import { Plan } from "../../../types/Plan";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Screen, SegmentControl } from "../../../components/ui";
import { FadeSlideIn } from "../../../components/FadeSlideIn";

const DAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type PlanView = "month" | "week";

export default function PlanScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [goalLabel, setGoalLabel] = useState("");
  const [view, setView] = useState<PlanView>("month");
  const [loading, setLoading] = useState(true);
  const mutedColor = useThemeColor("muted");
  const primaryColor = useThemeColor("primary");

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [])
  );

  const loadPlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const [userData, userPlans] = await Promise.all([
        backend.getUser(userId),
        backend.getUserPlans(userId),
      ]);

      setUser(userData);
      setPlans(userPlans);

      if (userData) {
        if (userData.goalType === "skill") {
          const skill = await backend.getSkill(userData.primaryGoalId);
          setGoalLabel(skill?.name ?? "Skill goal");
        } else {
          const path = await backend.getStrengthPath(userData.primaryGoalId);
          setGoalLabel(path?.name ?? "Strength goal");
        }
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen className="justify-center items-center" padded={false}>
        <LoadingSpinner size={56} />
      </Screen>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => a.dayIndex - b.dayIndex);
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Screen edges={["top"]}>
      <FadeSlideIn>
        <Text className="text-text-primary text-[28px] font-sans-semibold mb-1">
          Plan
        </Text>
        <Text className="text-text-muted text-[15px] font-sans mb-6">
          {goalLabel
            ? `${goalLabel} · ${user?.trainingDaysPerWeek ?? "—"} days/week`
            : "Your training calendar"}
        </Text>

        <SegmentControl
          options={[
            { value: "month" as const, label: "Month" },
            { value: "week" as const, label: "Week" },
          ]}
          value={view}
          onChange={setView}
          className="mb-8"
        />

        {view === "month" ? (
          <View className="mb-8">
            <Text className="text-text-primary text-[17px] font-sans-semibold mb-4">
              {monthLabel}
            </Text>
            <View className="border border-border rounded-xl p-5">
              <Text className="text-text-muted text-[15px] font-sans leading-6 mb-3">
                Month grid lands in the next wave. Your weekly sessions stay
                below — drag and day detail arrive with calendar dates.
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {sortedPlans.map((plan) => (
                  <View
                    key={plan.id}
                    className="bg-primary/10 px-3 py-2 rounded-md"
                  >
                    <Text className="text-primary text-[13px] font-sans-medium">
                      {DAY_NAMES[plan.dayIndex]?.slice(0, 3) ?? `D${plan.dayIndex}`}
                    </Text>
                  </View>
                ))}
                {sortedPlans.length === 0 && (
                  <Text className="text-text-muted font-sans text-[14px]">
                    No sessions scheduled yet
                  </Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View className="mb-8">
            <Text className="text-text-primary text-[17px] font-sans-semibold mb-4">
              This week
            </Text>
            {sortedPlans.length === 0 ? (
              <Text className="text-text-muted font-sans text-[15px]">
                No sessions on your plan yet.
              </Text>
            ) : (
              sortedPlans.map((plan) => (
                <View
                  key={plan.id}
                  className="flex-row items-center py-4 border-b border-border"
                >
                  <View className="w-24">
                    <Text className="text-text-primary font-sans-semibold text-[15px]">
                      {DAY_NAMES[plan.dayIndex] ?? `Day ${plan.dayIndex}`}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-secondary font-sans text-[14px]">
                      {plan.exercises.length} exercise
                      {plan.exercises.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={mutedColor}
                  />
                </View>
              ))
            )}
          </View>
        )}

        <View className="gap-1 mb-8">
          <Text className="text-text-muted text-[13px] font-sans-medium uppercase tracking-wide mb-2">
            Actions
          </Text>
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/(profile)")}
            className="py-3.5 flex-row items-center"
          >
            <Text className="text-primary font-sans-medium text-[15px] flex-1">
              Edit goal
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={primaryColor}
            />
          </AnimatedPressable>
          <View className="h-px bg-border" />
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/(home)/create-plan")}
            className="py-3.5 flex-row items-center"
          >
            <Text className="text-primary font-sans-medium text-[15px] flex-1">
              Rebuild plan
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={primaryColor}
            />
          </AnimatedPressable>
          <View className="h-px bg-border" />
          <View className="py-3.5 flex-row items-center opacity-50">
            <Text className="text-text-muted font-sans-medium text-[15px] flex-1">
              Time away
            </Text>
            <Text className="text-text-muted font-sans text-[13px]">Soon</Text>
          </View>
        </View>
      </FadeSlideIn>
    </Screen>
  );
}
