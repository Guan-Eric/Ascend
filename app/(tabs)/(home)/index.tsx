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
import { AnimatedCounter } from "../../../components/AnimatedCounter";
import {
  logFirstWorkoutStarted,
  logSampleWorkoutStarted,
} from "../../../utils/analytics";
import { PRO_ENTITLEMENT_ID } from "../../../constants/revenuecat";
import { paywallHref } from "../../../utils/access";

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

export default function HomeScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [todaysPlan, setTodaysPlan] = useState<Plan | null>(null);
  const [planExercises, setPlanExercises] = useState<Record<string, Exercise[]>>(
    {}
  );
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const primaryColor = useThemeColor("primary");
  const coralColor = useThemeColor("coral");

  const isSampleMode = Boolean(user && !hasProAccess && user.samplePlanId);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = async () => {
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
      setPlans(userPlans);
      setWeeklyStreak(historyStats.weeklyStreak);
      setTotalWorkouts(historyStats.totalWorkouts);

      let heroPlan = todayPlan;
      if (!heroPlan && userData?.samplePlanId) {
        heroPlan =
          userPlans.find((p) => p.id === userData.samplePlanId) ??
          userPlans[0] ??
          null;
      }
      setTodaysPlan(heroPlan);

      const exercisesMap: Record<string, Exercise[]> = {};
      for (const plan of userPlans) {
        const loadedExercises = await Promise.all(
          plan.exercises.map((ex) => backend.getExercise(ex.exerciseId))
        );
        exercisesMap[plan.id] = loadedExercises.filter(
          (ex) => ex !== null
        ) as Exercise[];
      }

      setPlanExercises(exercisesMap);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex: number) =>
    DAY_NAMES[dayIndex] || `Day ${dayIndex}`;

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

  const renderPlanCard = (plan: Plan, index: number) => {
    const exercises = planExercises[plan.id] || [];
    const isToday = todaysPlan?.id === plan.id;

    return (
      <FadeSlideIn delay={Math.min(index * 60, 300)}>
        <View
          className={`card-frosted p-6 rounded-3xl mb-4 shadow-elevated ${isToday ? "border border-primary/40" : ""}`}
        >
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-text-primary text-2xl font-bold">
                  {getDayName(plan.dayIndex)}
                </Text>
                {isToday && (
                  <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                    <Text className="text-primary text-xs font-bold">
                      {isSampleMode ? "FREE TRIAL" : "TODAY"}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-text-secondary text-sm">
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {hasProAccess && (
              <AnimatedPressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(home)/edit-plan",
                    params: { planId: plan.id },
                  })
                }
                className="bg-surface-elevated p-3 rounded-xl"
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color={primaryColor}
                />
              </AnimatedPressable>
            )}
          </View>

          <View className="glass p-5 rounded-2xl mb-4">
            {exercises.slice(0, 3).map((exercise, exerciseIndex) => {
              const planExercise = plan.exercises[exerciseIndex];
              return (
                <View
                  key={exercise.id}
                  className={`flex-row items-center mb-3 ${
                    exerciseIndex < Math.min(exercises.length, 3) - 1
                      ? "pb-3 border-b border-border/30"
                      : ""
                  }`}
                >
                  <View className="bg-primary/10 w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Text className="text-primary font-bold">
                      {exerciseIndex + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold mb-1">
                      {exercise.name}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {planExercise?.sets} sets × {planExercise?.target.value}{" "}
                      {planExercise?.target.type === "reps" ? "reps" : "sec"}
                    </Text>
                  </View>
                </View>
              );
            })}
            {exercises.length > 3 && (
              <View className="bg-surface-elevated/50 px-3 py-2 rounded-lg mt-1">
                <Text className="text-text-muted text-xs text-center">
                  +{exercises.length - 3} more exercises
                </Text>
              </View>
            )}
          </View>

          <AnimatedPressable
            onPress={() => startWorkout(plan.id)}
            className="bg-primary py-4 rounded-2xl shadow-elevated"
          >
            <View className="flex-row items-center justify-center">
              <MaterialCommunityIcons name="play" size={20} color="#000000" />
              <Text className="text-background text-center font-bold text-base ml-2">
                Start
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </FadeSlideIn>
    );
  };

  const renderListHeader = () => {
    const todayExercises = todaysPlan
      ? planExercises[todaysPlan.id] || []
      : [];

    return (
      <View className="mb-4">
        {isSampleMode && (
          <View className="card-frosted p-5 rounded-3xl mb-4 border border-secondary/40">
            <Text className="text-secondary text-lg font-bold mb-2">
              Free sample workout
            </Text>
            <Text className="text-text-secondary mb-4 leading-5">
              Complete this session to feel the Ascend flow. Unlock your full{" "}
              {user?.trainingDaysPerWeek ?? 3}-day program anytime.
            </Text>
            <AnimatedPressable
              onPress={() => openPaywall("home_unlock")}
              className="bg-secondary py-3 rounded-2xl"
            >
              <Text className="text-background text-center font-bold">
                Unlock Full Plan
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {hasProAccess && weeklyStreak > 0 && (
          <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3 mb-4">
            <MaterialCommunityIcons name="fire" size={22} color={coralColor} />
            <AnimatedCounter
              value={weeklyStreak}
              className="text-text-primary font-semibold ml-2"
            />
            <Text className="text-text-primary font-semibold ml-1">
              week streak
            </Text>
          </View>
        )}

        {totalWorkouts === 0 && plans.length > 0 && (
          <View className="card-frosted p-5 rounded-3xl mb-4 border border-primary/30">
            <Text className="text-primary text-lg font-bold mb-2">
              Day 1 checklist
            </Text>
            <Text className="text-text-secondary mb-1">
              1. Start your first workout below
            </Text>
            <Text className="text-text-secondary mb-1">
              2. Log your sets during the session
            </Text>
            <Text className="text-text-secondary">
              {isSampleMode
                ? "3. Unlock your full weekly plan"
                : "3. Browse presets to add more workouts"}
            </Text>
          </View>
        )}

        {todaysPlan && todayExercises.length > 0 && (
          <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated-lg border border-primary/40">
            <Text className="text-text-muted text-sm font-semibold uppercase mb-1">
              {isSampleMode ? "Your free workout" : "Today's workout"}
            </Text>
            <Text className="text-text-primary text-2xl font-bold mb-2">
              {getDayName(todaysPlan.dayIndex)}
            </Text>
            <Text className="text-text-secondary mb-4">
              {todayExercises.length} exercises ready
            </Text>
            <AnimatedPressable
              onPress={() => startWorkout(todaysPlan.id)}
              className="bg-primary py-4 rounded-2xl shadow-elevated"
            >
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="play" size={22} color="#000000" />
                <Text className="text-background font-bold text-lg ml-2">
                  Start Workout
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        )}

        <Text className="text-primary text-4xl font-bold mb-1">
          My Workouts
        </Text>
        <Text className="text-text-secondary text-sm mb-4">
          {plans.length} active {plans.length === 1 ? "plan" : "plans"}
        </Text>

        {hasProAccess && (
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/(home)/workout-presets")}
            className="card-frosted p-4 rounded-2xl mb-4 flex-row items-center shadow-elevated"
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color={primaryColor}
            />
            <View className="ml-3 flex-1">
              <Text className="text-text-primary font-bold text-base">
                Browse Workout Presets
              </Text>
              <Text className="text-text-secondary text-sm">
                Routines from r/bodyweightfitness, FitnessFAQs & more
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#7a86a8"
            />
          </AnimatedPressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
        <Text className="text-text-secondary mt-4">Loading workouts...</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <FlashList
          className="flex-1 px-6 pt-16"
          data={[0]}
          renderItem={() => (
            <>
              <Text className="text-primary text-5xl font-bold mb-3">
                My Workouts
              </Text>
              <Text className="text-text-secondary mb-8 text-lg">
                {isSampleMode
                  ? "Your sample workout is being prepared"
                  : "Create your personalized training schedule"}
              </Text>

              <View className="card-frosted p-8 rounded-3xl items-center justify-center mb-4">
                <Text className="text-text-primary text-2xl font-bold mb-3 text-center">
                  Start Your Journey
                </Text>
                <Text className="text-text-secondary text-center mb-8 leading-6">
                  {isSampleMode
                    ? "Unlock Ascend Pro to generate your full weekly plan"
                    : "Browse curated presets from popular programs or build your own custom plan"}
                </Text>
                {isSampleMode ? (
                  <AnimatedPressable
                    onPress={() => openPaywall("home_empty")}
                    className="bg-primary px-8 py-5 rounded-2xl flex-row items-center shadow-elevated-lg w-full justify-center"
                  >
                    <MaterialCommunityIcons
                      name="lock-open-outline"
                      size={24}
                      color="#000000"
                    />
                    <Text className="text-background font-bold text-lg ml-2">
                      Unlock Full Plan
                    </Text>
                  </AnimatedPressable>
                ) : (
                  <>
                    <AnimatedPressable
                      onPress={() =>
                        router.push("/(tabs)/(home)/workout-presets")
                      }
                      className="bg-primary px-8 py-5 rounded-2xl flex-row items-center shadow-elevated-lg mb-3 w-full justify-center"
                    >
                      <MaterialCommunityIcons
                        name="book-open-variant"
                        size={24}
                        color="#000000"
                      />
                      <Text className="text-background font-bold text-lg ml-2">
                        Browse Workout Presets
                      </Text>
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => router.push("/(tabs)/(home)/create-plan")}
                      className="bg-surface-elevated px-8 py-5 rounded-2xl flex-row items-center border border-border/40 w-full justify-center"
                    >
                      <MaterialCommunityIcons
                        name="plus-circle-outline"
                        size={24}
                        color={primaryColor}
                      />
                      <Text className="text-text-primary font-bold text-lg ml-2">
                        Create Custom Plan
                      </Text>
                    </AnimatedPressable>
                  </>
                )}
              </View>
            </>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        className="flex-1 px-6 pt-16"
        data={plans}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item, index }) => renderPlanCard(item, index)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 112 }}
      />

      {hasProAccess && (
        <View
          className="absolute bottom-6 right-6 flex-row gap-3 z-50"
          style={{ elevation: 12 }}
        >
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/(home)/workout-presets")}
            className="bg-surface-elevated p-4 rounded-2xl border border-border/40 shadow-elevated"
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={28}
              color={primaryColor}
            />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/(home)/create-plan")}
            className="bg-primary p-4 rounded-2xl shadow-elevated-lg"
          >
            <MaterialCommunityIcons name="plus" size={28} color="#000000" />
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}
