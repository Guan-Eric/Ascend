import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { router } from "expo-router";

export default function HomeScreen() {
  const [todaysPlan, setTodaysPlan] = useState<Plan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysPlan();
  }, []);

  const loadTodaysPlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      // Try to get today's plan
      let plan = await backend.getTodaysPlan(userId);

      setTodaysPlan(plan);

      // Load exercise details
      if (plan) {
        const exercisePromises = plan.exercises.map((ex) =>
          backend.getExercise(ex.exerciseId)
        );
        const loadedExercises = await Promise.all(exercisePromises);
        setExercises(loadedExercises.filter((ex) => ex !== null) as Exercise[]);
      }
    } catch (error) {
      console.error("Error loading today's plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePlan = async () => {
    if (!todaysPlan) return;

    try {
      await backend.markPlanCompleted(todaysPlan.id);

      // Mark all exercises as completed
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (userId) {
        for (const planExercise of todaysPlan.exercises) {
          await backend.markExerciseCompleted(
            userId,
            planExercise.exerciseId,
            planExercise.target.value
          );
        }
      }

      // Reload plan
      await loadTodaysPlan();
    } catch (error) {
      console.error("Error completing plan:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#38e8ff" />
        <Text className="text-text-secondary mt-4">Loading workout...</Text>
      </View>
    );
  }

  if (!todaysPlan) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-7xl mb-4">🎯</Text>
        <Text className="text-primary text-2xl font-bold mb-2 text-center">
          No Workout Today
        </Text>
        <Text className="text-text-secondary text-center">
          Complete your onboarding to get a personalized workout plan
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Today's Training
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Day {todaysPlan.dayIndex} of your workout plan
        </Text>

        {/* Warm Up Section */}
        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">Warm Up</Text>
          <Text className="text-text-primary leading-6">
            • Wrist rotations - 10 reps{"\n"}• Shoulder circles - 10 reps{"\n"}•
            Cat-cow stretches - 10 reps{"\n"}• Light cardio - 3 minutes
          </Text>
        </View>

        {/* Main Workout Section */}
        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">
            Main Workout
          </Text>
          {exercises.map((exercise, index) => {
            const planExercise = todaysPlan.exercises[index];
            return (
              <View key={exercise.id} className="mb-4">
                <Text className="text-text-primary text-lg font-semibold mb-1">
                  {exercise.name}
                </Text>
                <Text className="text-text-secondary mb-1">
                  {exercise.description}
                </Text>
                <Text className="text-primary font-bold">
                  {planExercise.sets} sets × {planExercise.target.value}{" "}
                  {planExercise.target.type === "reps" ? "reps" : "seconds"}
                </Text>
                {index < exercises.length - 1 && (
                  <View className="h-px bg-border mt-4" />
                )}
              </View>
            );
          })}
        </View>

        {/* Cool Down Section */}
        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">Cool Down</Text>
          <Text className="text-text-primary leading-6">
            • Standing quad stretch - 30s each{"\n"}• Shoulder stretch - 30s
            each{"\n"}• Hamstring stretch - 30s each{"\n"}• Deep breathing - 2
            minutes
          </Text>
        </View>

        {/* Complete Workout Button */}
        {!todaysPlan.completed && (
          <>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(home)/workout",
                  params: { planId: todaysPlan.id },
                })
              }
              className="bg-primary py-4 rounded-xl mb-3"
            >
              <Text className="text-background text-center font-bold text-lg">
                🏋️ Start Workout
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCompletePlan}
              className="border-2 border-primary py-4 rounded-xl mb-8"
            >
              <Text className="text-primary text-center font-bold text-lg">
                ✓ Mark as Complete
              </Text>
            </Pressable>
          </>
        )}

        {todaysPlan.completed && (
          <View className="bg-success/20 border-2 border-success p-6 rounded-xl mb-8">
            <Text className="text-success text-xl font-bold text-center">
              ✓ Workout Completed!
            </Text>
            <Text className="text-text-secondary text-center mt-2">
              Great job! Come back tomorrow for your next workout.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
