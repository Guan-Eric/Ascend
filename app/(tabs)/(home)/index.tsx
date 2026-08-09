import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import Purchases from "react-native-purchases";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { User } from "../../../types/User";
import { router, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import {
  logFirstWorkoutStarted,
  logSampleWorkoutStarted,
} from "../../../utils/analytics";
import { PRO_ENTITLEMENT_ID } from "../../../constants/revenuecat";
import { paywallHref } from "../../../utils/access";
import { Screen, Button } from "../../../components/ui";

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

export default function TodayScreen() {
  const [todaysPlans, setTodaysPlans] = useState<Plan[]>([]);
  const [planExercises, setPlanExercises] = useState<Record<string, Exercise[]>>(
    {}
  );
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const onPrimary = useThemeColor("background");

  const isSampleMode = Boolean(user && !hasProAccess && user.samplePlanId);

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [])
  );

  const loadToday = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const [userPlans, todayPlan, historyStats, userData, customerInfo] =
        await Promise.all([
          backend.getUserPlans(userId),
          backend.getTodaysPlan(userId),
          backend.getWorkoutHistoryStats(userId),
          backend.getUser(userId),
          Purchases.getCustomerInfo(),
        ]);

      setUser(userData);
      setHasProAccess(
        customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
      );
      setTotalWorkouts(historyStats.totalWorkouts);

      let sessions: Plan[] = [];
      if (todayPlan) {
        sessions = [todayPlan];
      } else if (userData?.samplePlanId) {
        const sample =
          userPlans.find((p) => p.id === userData.samplePlanId) ??
          userPlans[0];
        if (sample) sessions = [sample];
      }

      setTodaysPlans(sessions);

      const exercisesMap: Record<string, Exercise[]> = {};
      for (const plan of sessions) {
        const loaded = await Promise.all(
          plan.exercises.map((ex) => backend.getExercise(ex.exerciseId))
        );
        exercisesMap[plan.id] = loaded.filter(Boolean) as Exercise[];
      }
      setPlanExercises(exercisesMap);
    } catch (error) {
      console.error("Error loading today:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPaywall = (source: string) => {
    if (!user) return;
    router.push(
      paywallHref({
        source,
        level: user.level,
        trainingDays: user.trainingDaysPerWeek,
        goalType: user.goalType,
        primaryGoalId: user.primaryGoalId,
      })
    );
  };

  const startWorkout = (planId: string) => {
    if (isSampleMode) {
      logSampleWorkoutStarted({ planId });
    } else if (totalWorkouts === 0) {
      logFirstWorkoutStarted({ planId });
    }
    router.push({
      pathname: "/(tabs)/(home)/workout",
      params: { planId },
    });
  };

  if (loading) {
    return (
      <Screen className="justify-center items-center" padded={false}>
        <LoadingSpinner size={56} />
      </Screen>
    );
  }

  const isRestDay = todaysPlans.length === 0;

  return (
    <Screen padded={false} edges={["top"]}>
      <FlashList
        className="flex-1 px-6"
        data={todaysPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 112 }}
        ListHeaderComponent={
          <View className="mb-6">
            <FadeSlideIn>
              <Text className="text-text-primary text-[28px] font-sans-semibold mb-1">
                Today
              </Text>
              <Text className="text-text-muted text-[15px] font-sans mb-6">
                {isRestDay
                  ? "Nothing scheduled"
                  : `${todaysPlans.length} session${
                      todaysPlans.length !== 1 ? "s" : ""
                    }`}
              </Text>
            </FadeSlideIn>

            {isSampleMode && (
              <FadeSlideIn delay={40}>
                <View className="mb-6 pb-6 border-b border-border">
                  <Text className="text-text-primary text-[17px] font-sans-semibold mb-2">
                    Free sample
                  </Text>
                  <Text className="text-text-muted text-[15px] font-sans mb-4 leading-5">
                    Complete this session, then unlock your full{" "}
                    {user?.trainingDaysPerWeek ?? 3}-day program.
                  </Text>
                  <Button
                    label="Unlock full plan"
                    onPress={() => openPaywall("home_unlock")}
                  />
                </View>
              </FadeSlideIn>
            )}

            {isRestDay && (
              <FadeSlideIn delay={60}>
                <View className="py-12">
                  <Text className="text-text-primary text-[22px] font-sans-semibold mb-2">
                    Rest — recover
                  </Text>
                  <Text className="text-text-muted text-[15px] font-sans leading-6 mb-8">
                    No sessions today. Open Plan to see the week or rebuild your
                    schedule.
                  </Text>
                  <Button
                    label="Open Plan"
                    variant="ghost"
                    onPress={() => router.push("/(tabs)/(plan)")}
                  />
                </View>
              </FadeSlideIn>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const exercises = planExercises[item.id] || [];
          return (
            <FadeSlideIn delay={Math.min(index * 50, 200)}>
              <View className="mb-8">
                <View className="flex-row items-baseline justify-between mb-3">
                  <Text className="text-text-primary text-[22px] font-sans-semibold">
                    {DAY_NAMES[item.dayIndex] || "Session"}
                  </Text>
                  <Text className="text-text-muted text-[13px] font-sans-medium">
                    {exercises.length} exercise
                    {exercises.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                {exercises.slice(0, 4).map((exercise, exerciseIndex) => {
                  const planExercise = item.exercises[exerciseIndex];
                  return (
                    <View
                      key={exercise.id}
                      className="flex-row items-center py-3 border-b border-border"
                    >
                      <Text className="text-primary font-sans-semibold w-7 text-[15px]">
                        {exerciseIndex + 1}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-text-primary font-sans-medium text-[15px]">
                          {exercise.name}
                        </Text>
                        <Text className="text-text-muted text-[13px] font-sans mt-0.5">
                          {planExercise?.sets} × {planExercise?.target.value}{" "}
                          {planExercise?.target.type === "reps" ? "reps" : "sec"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                {exercises.length > 4 && (
                  <Text className="text-text-muted text-[13px] font-sans mt-3">
                    +{exercises.length - 4} more
                  </Text>
                )}

                <AnimatedPressable
                  onPress={() => startWorkout(item.id)}
                  className="bg-primary py-4 rounded-lg mt-5 flex-row items-center justify-center"
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={20}
                    color={onPrimary === "#0C0C0C" ? "#FAFAF8" : onPrimary}
                  />
                  <Text className="text-background font-sans-semibold text-base ml-2">
                    Log session
                  </Text>
                </AnimatedPressable>

                {hasProAccess && (
                  <AnimatedPressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(home)/edit-plan",
                        params: { planId: item.id },
                      })
                    }
                    className="py-3 mt-1"
                  >
                    <Text className="text-primary text-center font-sans-medium text-[14px]">
                      Edit session
                    </Text>
                  </AnimatedPressable>
                )}
              </View>
            </FadeSlideIn>
          );
        }}
      />
    </Screen>
  );
}
