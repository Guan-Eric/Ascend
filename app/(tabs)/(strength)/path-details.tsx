import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Skill } from "../../../types/Skill";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PathDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathId = params.pathId as string;

  const [path, setPath] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadPathDetails();
  }, []);

  const loadPathDetails = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const pathData = await backend.getStrengthPathWithExercises(pathId);
      if (!pathData) return;

      setPath(pathData.path);
      setExercises(pathData.exercises);

      const completed = await backend.getCompletedExerciseIds(userId);
      setCompletedIds(completed);

      // Calculate progress
      const completedCount = pathData.exercises.filter(ex =>
        completed.includes(ex.id)
      ).length;
      const progressPercent = Math.round(
        (completedCount / pathData.exercises.length) * 100
      );
      setProgress(progressPercent);
    } catch (error) {
      console.error("Error loading path details:", error);
    }
  };

  if (!path || exercises.length === 0) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
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
            {/* Header */}
            <View className="px-6 pt-16 pb-6">
              <Pressable onPress={() => router.back()} className="mb-4">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#38e8ff"
                />
              </Pressable>

              <Text className="text-text-primary text-4xl font-bold mb-3">
                {path.name}
              </Text>

              <Text className="text-text-secondary text-lg mb-4">
                {path.description}
              </Text>

              {/* Progress */}
              <View className="bg-surface p-4 rounded-xl">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-text-secondary">Your Progress</Text>
                  <Text className="text-primary text-xl font-bold">
                    {progress}%
                  </Text>
                </View>
                <View className="bg-surface-elevated h-3 rounded-full overflow-hidden">
                  <View
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <Text className="text-text-muted text-sm mt-2">
                  {completedIds.filter((id) => exercises.map((e) => e.id).includes(id)).length}
                  /{exercises.length} exercises completed
                </Text>
              </View>
            </View>

            {/* Progression Path */}
            <View className="px-6 pb-8">
              <Text className="text-primary text-xl font-bold mb-4">
                Progression Path
              </Text>

              {exercises.map((exercise, index) => {
                const isCompleted = completedIds.includes(exercise.id);
                const isLocked =
                  exercise.prerequisites &&
                  !exercise.prerequisites.every((prereq) =>
                    completedIds.includes(prereq)
                  );

                return (
                  <View key={exercise.id} className="mb-3">
                    <View className="flex-row">
                      {/* Progress Line */}
                      <View className="items-center mr-4">
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center ${
                            isCompleted
                              ? "bg-success"
                              : isLocked
                              ? "bg-surface-elevated"
                              : "bg-primary"
                          }`}
                        >
                          {isCompleted ? (
                            <MaterialCommunityIcons
                              name="check"
                              size={24}
                              color="#ffffff"
                            />
                          ) : isLocked ? (
                            <MaterialCommunityIcons
                              name="lock"
                              size={20}
                              color="#7a86a8"
                            />
                          ) : (
                            <Text className="text-background font-bold">
                              {index + 1}
                            </Text>
                          )}
                        </View>
                        {index < exercises.length - 1 && (
                          <View className="w-0.5 h-16 bg-border mt-2" />
                        )}
                      </View>

                      {/* Exercise Card */}
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/(strength)/exercise-details",
                            params: { exerciseId: exercise.id },
                          })
                        }
                        className={`flex-1 bg-surface p-4 rounded-xl border ${
                          isCompleted
                            ? "border-success"
                            : isLocked
                            ? "border-border opacity-60"
                            : "border-primary"
                        }`}
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-text-primary font-bold text-lg flex-1">
                            {exercise.name}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color="#7a86a8"
                          />
                        </View>
                        <Text className="text-text-secondary text-sm mb-2">
                          {exercise.description}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="bg-surface-elevated px-3 py-1 rounded mr-2">
                            <Text className="text-text-secondary text-xs">
                              {exercise.target.value}{" "}
                              {exercise.target.type === "reps" ? "reps" : "sec"}
                            </Text>
                          </View>
                          <View className="bg-surface-elevated px-3 py-1 rounded">
                            <Text className="text-text-secondary text-xs capitalize">
                              {exercise.level}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      />
    </View>
  );
}