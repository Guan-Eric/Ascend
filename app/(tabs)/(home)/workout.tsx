// app/(tabs)/(home)/workout.tsx - Updated with progression detection
import { View, Text, TextInput, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import { logSampleWorkoutCompleted } from "../../../utils/analytics";
import { paywallHref } from "../../../utils/access";
import Purchases from "react-native-purchases";
import { PRO_ENTITLEMENT_ID } from "../../../constants/revenuecat";

type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
  actualValues: number[];
};

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [currentSetReps, setCurrentSetReps] = useState("");
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTime] = useState(60);
  const [startTime, setStartTime] = useState(Date.now());
  const primaryColor = useThemeColor('primary');
  const successColor = useThemeColor('success');

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const workoutPlan = await backend.getPlan(planId);
      if (!workoutPlan) return;

      setPlan(workoutPlan);

      const exercisePromises = workoutPlan.exercises.map((ex) =>
        backend.getExercise(ex.exerciseId)
      );
      const loadedExercises = await Promise.all(exercisePromises);
      setExercises(loadedExercises.filter((ex) => ex !== null) as Exercise[]);

      const initialProgress: ExerciseProgress[] = workoutPlan.exercises.map(
        (ex) => ({
          exerciseId: ex.exerciseId,
          completedSets: 0,
          actualValues: [],
        })
      );
      setProgress(initialProgress);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error loading workout:", error);
    }
  };

  useEffect(() => {
    if (!restEndTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((restEndTime - Date.now()) / 1000)
      );
      setRestRemaining(remaining);

      if (remaining === 0) {
        setRestEndTime(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [restEndTime]);

  const completeSet = () => {
    if (!plan) return;

    const repsValue = parseInt(currentSetReps) || 0;
    if (repsValue === 0) {
      Alert.alert("Error", "Please enter reps or time completed");
      return;
    }

    const updated = [...progress];
    updated[currentExerciseIndex].completedSets++;
    updated[currentExerciseIndex].actualValues.push(repsValue);
    setProgress(updated);
    setCurrentSetReps("");

    setRestEndTime(Date.now() + restTime * 1000);

    if (
      updated[currentExerciseIndex].completedSets >=
      plan.exercises[currentExerciseIndex].sets
    ) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setRestEndTime(null);
      }
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setRestEndTime(null);
    }
  };

  const finishWorkout = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId || !plan) return;

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Save workout history
      await backend.saveWorkoutHistory({
        userId,
        planId: plan.id,
        dayIndex: plan.dayIndex,
        exercises: plan.exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          completedSets: progress[index].completedSets,
          target: ex.target,
          actualValues: progress[index].actualValues,
        })),
        completedAt: Date.now(),
        duration,
      });

      const user = await backend.getUser(userId);
      const customerInfoEarly = await Purchases.getCustomerInfo();
      const hasProEarly =
        customerInfoEarly.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
      const autoProgress =
        hasProEarly && (user?.autoProgressExercises ?? true);

      // Check for progressions and mark exercises complete
      const progressionMessages: string[] = [];
      const autoProgressedExercises: Array<{ oldName: string; newName: string }> = [];

      for (const prog of progress) {
        if (prog.actualValues.length > 0) {
          const bestValue = Math.max(...prog.actualValues);
          const exercise = exercises.find(ex => ex.id === prog.exerciseId);

          if (exercise && bestValue >= exercise.target.value) {
            const previousBest = await backend.getPersonalBest(userId, prog.exerciseId);

            if (!previousBest || bestValue > previousBest) {
              await backend.markExerciseCompleted(userId, prog.exerciseId, bestValue);

              if (exercise.nextProgressionId) {
                const nextExercise = await backend.getExercise(exercise.nextProgressionId);
                if (nextExercise) {
                  progressionMessages.push(
                    `🎉 ${exercise.name} completed! Ready for: ${nextExercise.name}`
                  );

                  if (autoProgress) {
                    const { autoProgressPlans } = await import("../../../backend/autoProgression");
                    const { updatedPlans } = await autoProgressPlans(
                      userId,
                      exercise.id,
                      nextExercise.id
                    );

                    if (updatedPlans.length > 0) {
                      autoProgressedExercises.push({
                        oldName: exercise.name,
                        newName: nextExercise.name,
                      });
                    }
                  }
                }
              } else {
                progressionMessages.push(`🏆 ${exercise.name} mastered!`);
              }
            }
          } else {
            await backend.markExerciseCompleted(userId, prog.exerciseId, bestValue);
          }
        }
      }

      // Build completion message
      let message = "Great job! Your workout has been logged.";

      if (progressionMessages.length > 0) {
        message += "\n\n" + progressionMessages.join("\n");
      }

      if (autoProgressedExercises.length > 0) {
        message += "\n\n🔄 Auto-Progressed:\n";
        autoProgressedExercises.forEach(({ oldName, newName }) => {
          message += `• ${oldName} → ${newName}\n`;
        });
        message += "\nYour workout plans have been updated!";
      }

      const isSampleWorkout =
        !hasProEarly &&
        Boolean(user?.samplePlanId) &&
        user?.samplePlanId === plan.id &&
        !user?.sampleWorkoutCompleted;

      if (isSampleWorkout && user) {
        await backend.updateUser(userId, { sampleWorkoutCompleted: true });
        logSampleWorkoutCompleted({ planId: plan.id });

        Alert.alert(
          "Workout Complete!",
          "Nice work. Unlock your full weekly plan to keep progressing.",
          [
            {
              text: "Unlock Full Plan",
              onPress: () =>
                router.replace(
                  paywallHref({
                    source: "sample_workout",
                    level: user.level,
                    trainingDays: user.trainingDaysPerWeek,
                    goalType: user.goalType,
                    primaryGoalId: user.primaryGoalId,
                  })
                ),
            },
          ]
        );
        return;
      }

      Alert.alert("Workout Complete!", message, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error finishing workout:", error);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  if (!plan || exercises.length === 0) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
        <Text className="text-text-secondary mt-4">Loading workout...</Text>
      </View>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const currentPlanExercise = plan.exercises[currentExerciseIndex];
  const currentProgress = progress[currentExerciseIndex];
  const allExercisesComplete = progress.every(
    (p, i) => p.completedSets >= plan.exercises[i].sets
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <AnimatedPressable onPress={() => router.back()} className="">
            <MaterialCommunityIcons name="close" size={28} color={primaryColor} />
          </AnimatedPressable>
          <Text className="text-text-secondary">
            Exercise {currentExerciseIndex + 1}/{exercises.length}
          </Text>
        </View>

        <View className="bg-surface-elevated h-2 rounded-full overflow-hidden mb-6">
          <View
            className="bg-primary h-full rounded-full"
            style={{
              width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%`,
            }}
          />
        </View>
      </View>

      <FlashList
        className="flex-1 px-6"
        data={[0]}
        renderItem={() => (
          <>
            <FadeSlideIn key={`current-${currentExerciseIndex}`}>
              <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                <Text className="text-primary text-sm font-semibold mb-2 uppercase">
                  Current Exercise
                </Text>
                <Text className="text-text-primary text-3xl font-bold mb-2">
                  {currentExercise.name}
                </Text>
                <Text className="text-text-secondary mb-4">
                  {currentExercise.description}
                </Text>

                <View className="flex-row items-center mb-4">
                  <View className="bg-surface-elevated px-4 py-2 rounded-lg mr-3">
                    <Text className="text-text-secondary text-xs">Target</Text>
                    <Text className="text-text-primary font-bold text-lg">
                      {currentPlanExercise.target.value}{" "}
                      {currentPlanExercise.target.type === "reps" ? "reps" : "sec"}
                    </Text>
                  </View>
                  <View className="bg-surface-elevated px-4 py-2 rounded-lg">
                    <Text className="text-text-secondary text-xs">Sets</Text>
                    <Text className="text-text-primary font-bold text-lg">
                      {currentProgress.completedSets}/{currentPlanExercise.sets}
                    </Text>
                  </View>
                </View>

                {currentProgress.actualValues.length > 0 && (
                  <View className="bg-surface-elevated p-3 rounded-lg">
                    <Text className="text-text-secondary text-xs mb-2">Completed Sets:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {currentProgress.actualValues.map((value, idx) => (
                        <View key={idx} className="bg-success/20 px-3 py-1 rounded">
                          <Text className="text-success font-bold text-sm">
                            Set {idx + 1}: {value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </FadeSlideIn>

            {!allExercisesComplete && (
              <FadeSlideIn key={`log-${currentExerciseIndex}`} delay={80}>
                <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                  <Text className="text-text-primary text-lg font-bold mb-3">
                    Log Set {currentProgress.completedSets + 1}
                  </Text>
                  <TextInput
                    value={currentSetReps}
                    onChangeText={setCurrentSetReps}
                    placeholder={`Enter ${currentPlanExercise.target.type === "reps" ? "reps" : "seconds"
                      }`}
                    placeholderTextColor="#7a86a8"
                    keyboardType="numeric"
                    className="bg-surface-elevated text-text-primary px-4 py-4 rounded-xl text-xl font-bold mb-4 text-center"
                  />
                  {restRemaining > 0 && (
                    <Text className="text-warning text-sm text-center mb-2">
                      Suggested rest: {restRemaining}s remaining
                    </Text>
                  )}

                  <AnimatedPressable
                    onPress={completeSet}
                    className="bg-primary py-4 rounded-2xl mb-3  shadow-elevated"
                  >
                    <Text className="text-background text-center font-bold text-lg">
                      {restRemaining > 0 ? "Log Next Set Early" : "Complete Set"}
                    </Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    onPress={skipExercise}
                    className="border-2 border-text-muted py-3 rounded-2xl "
                  >
                    <Text className="text-text-muted text-center font-bold">Skip Exercise</Text>
                  </AnimatedPressable>
                </View>
              </FadeSlideIn>
            )}

            <FadeSlideIn delay={160}>
              <View className="card-frosted p-6 rounded-3xl mb-8 shadow-elevated">
                <Text className="text-text-primary text-lg font-bold mb-4">
                  Workout Overview
                </Text>
                {exercises.map((exercise, index) => {
                  const planEx = plan.exercises[index];
                  const prog = progress[index];
                  const isComplete = prog.completedSets >= planEx.sets;

                  return (
                    <View
                      key={exercise.id}
                      className={`flex-row items-center justify-between mb-3 pb-3 ${index < exercises.length - 1 ? "border-b border-border" : ""
                        }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`${isComplete ? "text-success" : "text-text-primary"
                            } font-semibold`}
                        >
                          {exercise.name}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          {prog.completedSets}/{planEx.sets} sets
                          {prog.actualValues.length > 0 &&
                            ` • Best: ${Math.max(...prog.actualValues)}`}
                        </Text>
                      </View>
                      {isComplete && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={successColor} />
                      )}
                    </View>
                  );
                })}
              </View>
            </FadeSlideIn>
          </>
        )}
      />

      {allExercisesComplete && (
        <View className="px-6 pb-8 bg-background">
          <AnimatedPressable
            onPress={finishWorkout}
            className="bg-success py-4 rounded-2xl  shadow-elevated"
          >
            <Text className="text-background text-center font-bold text-lg">
              Finish Workout
            </Text>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}