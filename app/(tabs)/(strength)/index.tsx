// app/(tabs)/(strength)/index.tsx - Updated
import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Skill } from "../../../types/Skill";
import { Exercise } from "../../../types/Exercise";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StrengthScreen() {
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const [pathExercises, setPathExercises] = useState<Record<string, Exercise[]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrengthPaths();
  }, []);

  const loadStrengthPaths = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;

      const paths = await backend.getAllStrengthPaths();
      setStrengthPaths(paths);

      const exercisesMap: Record<string, Exercise[]> = {};

      for (const path of paths) {
        const pathData = await backend.getStrengthPathWithExercises(path.id);
        if (pathData) {
          exercisesMap[path.id] = pathData.exercises;
        }
      }

      setPathExercises(exercisesMap);

      if (userId) {
        const completed = await backend.getCompletedExerciseIds(userId);
        setCompletedIds(completed);
      }
    } catch (error) {
      console.error("Error loading strength paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPathColor = (pathId: string) => {
    switch (pathId) {
      case "push_strength":
        return "bg-error";
      case "pull_strength":
        return "bg-secondary";
      case "leg_strength":
        return "bg-success";
      case "core_strength":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  const getPathProgress = (pathId: string) => {
    const exercises = pathExercises[pathId] || [];
    if (exercises.length === 0) return 0;

    const completedCount = exercises.filter((ex) => completedIds.includes(ex.id)).length;

    return Math.round((completedCount / exercises.length) * 100);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
        <Text className="text-text-secondary mt-4">Loading strength paths...</Text>
      </View>
    );
  }

  return (
    <FlashList
      className="flex-1 bg-background"
      data={[0]}
      renderItem={() => (
        <>
          <View className="px-6 pt-16">
            <Text className="text-primary text-4xl font-bold mb-2">Strength Paths</Text>
            <Text className="text-text-secondary mb-8 text-lg">
              Build functional strength across all movement patterns
            </Text>

            {strengthPaths.length === 0 && (
              <View className="card-frosted p-8 rounded-3xl shadow-elevated">
                <Text className="text-text-primary text-center">
                  No strength paths available. Please seed your database.
                </Text>
              </View>
            )}

            {strengthPaths.map((path) => {
              const exercises = pathExercises[path.id] || [];
              const progress = getPathProgress(path.id);

              return (
                <View key={path.id} className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                  <View className={`${getPathColor(path.id)} w-20 h-1.5 rounded-full mb-4`} />

                  <Text className="text-text-primary text-2xl font-bold mb-2">{path.name}</Text>

                  <Text className="text-text-secondary text-sm mb-4 leading-5">
                    {path.description}
                  </Text>

                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-text-secondary text-sm">Your Progress</Text>
                      <Text className="text-primary font-bold">{progress}%</Text>
                    </View>
                    <View className="bg-surface-elevated/50 h-2.5 rounded-full overflow-hidden">
                      <View
                        className="bg-primary h-full rounded-full shadow-elevated"
                        style={{ width: `${progress}%` }}
                      />
                    </View>
                  </View>

                  <View className="glass p-4 rounded-2xl">
                    <Text className="text-text-secondary text-xs font-semibold mb-3 uppercase">
                      Exercises ({exercises.length})
                    </Text>
                    {exercises.slice(0, 3).map((exercise) => {
                      const isCompleted = completedIds.includes(exercise.id);

                      return (
                        <Pressable
                          key={exercise.id}
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/(strength)/exercise-details",
                              params: { exerciseId: exercise.id },
                            })
                          }
                          className="flex-row items-center justify-between mb-2 pb-2 border-b border-border/30 hover-scale"
                        >
                          <View className="flex-1">
                            <Text
                              className={`${
                                isCompleted ? "text-success" : "text-text-primary"
                              } text-base font-semibold`}
                            >
                              {exercise.name}
                            </Text>
                            <Text className="text-text-secondary text-xs">
                              {exercise.target.value}{" "}
                              {exercise.target.type === "reps" ? "reps" : "sec"} • {exercise.level}
                            </Text>
                          </View>
                          {isCompleted ? (
                            <MaterialCommunityIcons name="check-circle" size={20} color="#22c55e" />
                          ) : (
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#7a86a8" />
                          )}
                        </Pressable>
                      );
                    })}
                    {exercises.length > 3 && (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/(strength)/path-details",
                            params: { pathId: path.id },
                          })
                        }
                        className="mt-2 hover-scale"
                      >
                        <Text className="text-primary text-sm font-semibold">
                          View all {exercises.length} exercises →
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    />
  );
}