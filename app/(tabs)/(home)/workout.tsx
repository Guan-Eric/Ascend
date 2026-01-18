import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
  bestValue: number;
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
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);

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

      // Initialize progress
      const initialProgress: ExerciseProgress[] = workoutPlan.exercises.map(
        (ex) => ({
          exerciseId: ex.exerciseId,
          completedSets: 0,
          bestValue: 0,
        })
      );
      setProgress(initialProgress);
    } catch (error) {
      console.error("Error loading workout:", error);
    }
  };

  const completeSet = () => {
    if (!plan) return;

    const repsValue = parseInt(currentSetReps) || 0;
    if (repsValue === 0) {
      Alert.alert("Error", "Please enter reps or time completed");
      return;
    }

    const updated = [...progress];
    updated[currentExerciseIndex].completedSets++;
    updated[currentExerciseIndex].bestValue = Math.max(
      updated[currentExerciseIndex].bestValue,
      repsValue
    );
    setProgress(updated);
    setCurrentSetReps("");

    // Check if all sets completed for current exercise
    if (
      updated[currentExerciseIndex].completedSets >=
      plan.exercises[currentExerciseIndex].sets
    ) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }
    } else {
      // Rest between sets
      setIsResting(true);
      setTimeout(() => setIsResting(false), restTime * 1000);
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(false);
    }
  };

  const finishWorkout = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId || !plan) return;

      // Mark plan as completed
      await backend.markPlanCompleted(plan.id);

      // Save progress for each exercise
      for (const prog of progress) {
        if (prog.bestValue > 0) {
          await backend.markExerciseCompleted(
            userId,
            prog.exerciseId,
            prog.bestValue
          );
        }
      }

      Alert.alert("Workout Complete!", "Great job! Keep up the good work.", [
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
        <Text className="text-text-secondary">Loading workout...</Text>
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
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={28} color="#38e8ff" />
          </Pressable>
          <Text className="text-text-secondary">
            Exercise {currentExerciseIndex + 1}/{exercises.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="bg-surface-elevated h-2 rounded-full overflow-hidden mb-6">
          <View
            className="bg-primary h-full rounded-full"
            style={{
              width: `${
                ((currentExerciseIndex + 1) / exercises.length) * 100
              }%`,
            }}
          />
        </View>
      </View>

      <FlashList
        className="flex-1 px-6"
        data={[0]}
        renderItem={() => (
          <>
            {/* Current Exercise Card */}
            <View className="bg-surface p-6 rounded-xl mb-4 border-2 border-primary">
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
                    {currentPlanExercise.target.type === "reps"
                      ? "reps"
                      : "sec"}
                  </Text>
                </View>
                <View className="bg-surface-elevated px-4 py-2 rounded-lg">
                  <Text className="text-text-secondary text-xs">Sets</Text>
                  <Text className="text-text-primary font-bold text-lg">
                    {currentProgress.completedSets}/{currentPlanExercise.sets}
                  </Text>
                </View>
              </View>
            </View>

            {/* Input Section */}
            {!allExercisesComplete && (
              <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
                <Text className="text-text-primary text-lg font-bold mb-3">
                  Log Your Set
                </Text>
                <TextInput
                  value={currentSetReps}
                  onChangeText={setCurrentSetReps}
                  placeholder={`Enter ${
                    currentPlanExercise.target.type === "reps"
                      ? "reps"
                      : "seconds"
                  }`}
                  placeholderTextColor="#7a86a8"
                  keyboardType="numeric"
                  className="bg-surface-elevated text-text-primary px-4 py-4 rounded-xl text-xl font-bold mb-4 text-center"
                />

                {isResting ? (
                  <View className="bg-warning/20 p-4 rounded-xl items-center">
                    <Text className="text-warning font-bold text-lg mb-2">
                      Resting...
                    </Text>
                    <Text className="text-text-secondary">
                      {restTime}s between sets
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={completeSet}
                    className="bg-primary py-4 rounded-xl mb-3"
                  >
                    <Text className="text-background text-center font-bold text-lg">
                      ✓ Complete Set
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={skipExercise}
                  className="border-2 border-text-muted py-3 rounded-xl"
                >
                  <Text className="text-text-muted text-center font-bold">
                    Skip Exercise
                  </Text>
                </Pressable>
              </View>
            )}

            {/* All Exercises Overview */}
            <View className="bg-surface p-6 rounded-xl mb-8 border border-border">
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
                    className={`flex-row items-center justify-between mb-3 pb-3 ${
                      index < exercises.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <View className="flex-1">
                      <Text
                        className={`${
                          isComplete ? "text-success" : "text-text-primary"
                        } font-semibold`}
                      >
                        {exercise.name}
                      </Text>
                      <Text className="text-text-secondary text-sm">
                        {prog.completedSets}/{planEx.sets} sets
                      </Text>
                    </View>
                    {isComplete && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#22c55e"
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      />

      {allExercisesComplete && (
        <View className="px-6 pb-8 bg-background">
          <Pressable
            onPress={finishWorkout}
            className="bg-success py-4 rounded-xl"
          >
            <Text className="text-background text-center font-bold text-lg">
              🎉 Finish Workout
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
