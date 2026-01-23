import { View, Text, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";

export default function ExerciseDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [nextExercise, setNextExercise] = useState<Exercise | null>(null);
  const [previousExercises, setPreviousExercises] = useState<Exercise[]>([]);
  const [canAccess, setCanAccess] = useState(false);
  const primaryColor = useThemeColor('primary');
  const warningColor = useThemeColor('warning');

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

      const completedIds = await backend.getCompletedExerciseIds(userId);
      const access = await backend.canAccessExercise(exerciseId, completedIds);
      setCanAccess(access);

      if (ex.nextProgressionId) {
        const next = await backend.getExercise(ex.nextProgressionId);
        setNextExercise(next);
      }

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
        <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
        <Text className="text-text-secondary">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        className="flex-1"
        data={[0]}
        renderItem={() => (
          <>
            <View className="px-6 pt-16 pb-6">
              <Pressable onPress={() => router.back()} className="mb-4 hover-scale">
                <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
              </Pressable>

              <View className="flex-row items-center mb-3">
                <View className="bg-primary/10 w-14 h-14 rounded-2xl items-center justify-center">
                  <MaterialCommunityIcons
                    name={getCategoryIcon(exercise.category)}
                    size={32}
                    color={primaryColor}
                  />
                </View>
                <View
                  className={`ml-auto px-4 py-2 rounded-full ${exercise.level === "beginner"
                      ? "bg-success/20"
                      : exercise.level === "intermediate"
                        ? "bg-warning/20"
                        : "bg-error/20"
                    }`}
                >
                  <Text
                    className={`${getLevelColor(exercise.level)} text-sm font-bold uppercase`}
                  >
                    {exercise.level}
                  </Text>
                </View>
              </View>

              <Text className="text-text-primary text-4xl font-bold mb-4">
                {exercise.name}
              </Text>

              <View className="flex-row gap-3">
                <View className="card-frosted px-4 py-3 rounded-xl flex-1">
                  <Text className="text-text-secondary text-xs uppercase mb-1">Category</Text>
                  <Text className="text-text-primary font-bold capitalize">
                    {exercise.category}
                  </Text>
                </View>
                <View className="card-frosted px-4 py-3 rounded-xl flex-1">
                  <Text className="text-text-secondary text-xs uppercase mb-1">Equipment</Text>
                  <Text className="text-text-primary font-bold capitalize">
                    {exercise.equipment}
                  </Text>
                </View>
                <View className="card-frosted px-4 py-3 rounded-xl flex-1">
                  <Text className="text-text-secondary text-xs uppercase mb-1">Target</Text>
                  <Text className="text-text-primary font-bold">
                    {exercise.target.value}{" "}
                    {exercise.target.type === "reps" ? "reps" : "sec"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="px-6">
              {!canAccess && (
                <View className="card-frosted border-2 border-warning p-5 rounded-3xl mb-4 shadow-elevated">
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons name="lock" size={24} color={warningColor} />
                    <Text className="text-warning font-bold ml-2 text-base">
                      Locked Exercise
                    </Text>
                  </View>
                  <Text className="text-text-secondary leading-5">
                    Complete the prerequisites below to unlock this exercise
                  </Text>
                </View>
              )}

              <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                <Text className="text-primary text-lg font-bold mb-3">How to Perform</Text>
                <Text className="text-text-primary leading-6">{exercise.description}</Text>
              </View>

              {previousExercises.length > 0 && (
                <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                  <Text className="text-primary text-lg font-bold mb-3">Prerequisites</Text>
                  {previousExercises.map((prevEx) => (
                    <Pressable
                      key={prevEx.id}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/(skills)/exercise-details",
                          params: { exerciseId: prevEx.id },
                        })
                      }
                      className="glass flex-row items-center justify-between p-4 rounded-2xl mb-2 hover-scale"
                    >
                      <Text className="text-text-primary font-semibold flex-1">
                        {prevEx.name}
                      </Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                    </Pressable>
                  ))}
                </View>
              )}

              {nextExercise && (
                <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                  <Text className="text-primary text-lg font-bold mb-3">Next Progression</Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(skills)/exercise-details",
                        params: { exerciseId: nextExercise.id },
                      })
                    }
                    className="glass flex-row items-center justify-between p-4 rounded-2xl hover-scale"
                  >
                    <View className="flex-1">
                      <Text className="text-text-primary font-semibold mb-1">
                        {nextExercise.name}
                      </Text>
                      <Text className="text-text-secondary text-sm">
                        {nextExercise.target.value}{" "}
                        {nextExercise.target.type === "reps" ? "reps" : "sec"}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                  </Pressable>
                </View>
              )}
            </View>
          </>
        )}
      />

      <View className="px-6 pb-8 bg-background">
        <Pressable
          onPress={addToPlan}
          className="bg-primary py-4 rounded-2xl hover-scale shadow-elevated"
        >
          <Text className="text-background text-center font-bold text-lg">
            + Add to Plan
          </Text>
        </Pressable>
      </View>
    </View>
  );
}