import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ExerciseDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [nextExercise, setNextExercise] = useState<Exercise | null>(null);
  const [previousExercises, setPreviousExercises] = useState<Exercise[]>([]);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    loadExerciseDetails();
  }, []);

  const loadExerciseDetails = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const ex = await backend.getExercise(exerciseId);
      if (!ex) return;
      setExercise(ex);

      // Check if user can access this exercise
      const completedIds = await backend.getCompletedExerciseIds(userId);
      const access = await backend.canAccessExercise(exerciseId, completedIds);
      setCanAccess(access);

      // Get next progression
      if (ex.nextProgressionId) {
        const next = await backend.getExercise(ex.nextProgressionId);
        setNextExercise(next);
      }

      // Get previous exercises (prerequisites)
      if (ex.prerequisites) {
        const prevExercises = await backend.getExercisesByIds(ex.prerequisites);
        setPreviousExercises(prevExercises);
      }
    } catch (error) {
      console.error("Error loading exercise details:", error);
    }
  };

  const addToPlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId || !exercise) return;

      await backend.createPlan({
        userId,
        goalId: "custom",
        dayIndex: 1,
        exercises: [
          {
            exerciseId: exercise.id,
            sets: 3,
            target: exercise.target,
          },
        ],
        completed: false,
        createdAt: Date.now(),
      });

      Alert.alert("Success", "Exercise added to your workout plan!");
    } catch (error) {
      console.error("Error adding to plan:", error);
      Alert.alert("Error", "Failed to add exercise");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "push":
        return "arm-flex";
      case "pull":
        return "weight-lifter";
      case "legs":
        return "human-handsdown";
      case "core":
        return "stomach";
      case "skill":
        return "medal-outline";
      default:
        return "dumbbell";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-success";
      case "intermediate":
        return "text-warning";
      case "advanced":
        return "text-error";
      default:
        return "text-primary";
    }
  };

  if (!exercise) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Pressable onPress={() => router.back()} className="mb-4">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#38e8ff"
            />
          </Pressable>

          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons
              name={getCategoryIcon(exercise.category)}
              size={40}
              color="#38e8ff"
            />
            <Text
              className={`${getLevelColor(
                exercise.level
              )} text-sm font-bold uppercase ml-auto`}
            >
              {exercise.level}
            </Text>
          </View>

          <Text className="text-text-primary text-4xl font-bold mb-3">
            {exercise.name}
          </Text>

          <View className="flex-row items-center">
            <View className="bg-surface px-4 py-2 rounded-lg mr-3">
              <Text className="text-text-secondary text-xs uppercase">
                Category
              </Text>
              <Text className="text-text-primary font-bold capitalize">
                {exercise.category}
              </Text>
            </View>
            <View className="bg-surface px-4 py-2 rounded-lg mr-3">
              <Text className="text-text-secondary text-xs uppercase">
                Equipment
              </Text>
              <Text className="text-text-primary font-bold capitalize">
                {exercise.equipment}
              </Text>
            </View>
            <View className="bg-surface px-4 py-2 rounded-lg">
              <Text className="text-text-secondary text-xs uppercase">
                Target
              </Text>
              <Text className="text-text-primary font-bold">
                {exercise.target.value}{" "}
                {exercise.target.type === "reps" ? "reps" : "sec"}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6">
          {/* Access Status */}
          {!canAccess && (
            <View className="bg-warning/20 border-2 border-warning p-4 rounded-xl mb-4">
              <Text className="text-warning font-bold mb-1">
                🔒 Locked Exercise
              </Text>
              <Text className="text-text-secondary">
                Complete the prerequisites below to unlock this exercise
              </Text>
            </View>
          )}

          {/* Description */}
          <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
            <Text className="text-primary text-lg font-bold mb-3">
              How to Perform
            </Text>
            <Text className="text-text-primary leading-6">
              {exercise.description}
            </Text>
          </View>

          {/* Prerequisites */}
          {previousExercises.length > 0 && (
            <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
              <Text className="text-primary text-lg font-bold mb-3">
                Prerequisites
              </Text>
              {previousExercises.map((prevEx) => (
                <Pressable
                  key={prevEx.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(skills)/exercise-details",
                      params: { exerciseId: prevEx.id },
                    })
                  }
                  className="flex-row items-center justify-between p-3 bg-surface-elevated rounded-lg mb-2"
                >
                  <Text className="text-text-primary font-semibold flex-1">
                    {prevEx.name}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#7a86a8"
                  />
                </Pressable>
              ))}
            </View>
          )}

          {/* Next Progression */}
          {nextExercise && (
            <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
              <Text className="text-primary text-lg font-bold mb-3">
                Next Progression
              </Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(skills)/exercise-details",
                    params: { exerciseId: nextExercise.id },
                  })
                }
                className="flex-row items-center justify-between p-3 bg-surface-elevated rounded-lg"
              >
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold">
                    {nextExercise.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {nextExercise.target.value}{" "}
                    {nextExercise.target.type === "reps" ? "reps" : "sec"}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#7a86a8"
                />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 pb-8 bg-background">
        <Pressable onPress={addToPlan} className="bg-primary py-4 rounded-xl">
          <Text className="text-background text-center font-bold text-lg">
            + Add to Plan
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
