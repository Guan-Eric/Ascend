import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Skill } from "../../../types/Skill";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";

export default function PathDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathId = params.pathId as string;

  const [path, setPath] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const primaryColor = useThemeColor('primary');

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

      const completedCount = pathData.exercises.filter((ex) => completed.includes(ex.id)).length;
      const progressPercent = Math.round((completedCount / pathData.exercises.length) * 100);
      setProgress(progressPercent);
    } catch (error) {
      console.error("Error loading path details:", error);
    }
  };

  if (!path || exercises.length === 0) {
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

              <Text className="text-text-primary text-4xl font-bold mb-3">{path.name}</Text>

              <Text className="text-text-secondary text-lg mb-6 leading-6">
                {path.description}
              </Text>

              <View className="card-frosted p-5 rounded-3xl shadow-elevated">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-text-secondary font-medium">Your Progress</Text>
                  <Text className="text-primary text-2xl font-bold">{progress}%</Text>
                </View>
                <View className="bg-surface-elevated/50 h-3 rounded-full overflow-hidden mb-2">
                  <View
                    className="bg-primary h-full rounded-full shadow-elevated"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <Text className="text-text-muted text-sm">
                  {completedIds.filter((id) => exercises.map((e) => e.id).includes(id)).length}/
                  {exercises.length} exercises completed
                </Text>
              </View>
            </View>

            <View className="px-6 pb-8">
              <Text className="text-primary text-xl font-bold mb-4">Progression Path</Text>

              {exercises.map((exercise, index) => {
                const isCompleted = completedIds.includes(exercise.id);
                const isLocked =
                  exercise.prerequisites &&
                  !exercise.prerequisites.every((prereq) => completedIds.includes(prereq));

                return (
                  <View key={exercise.id} className="mb-3">
                    <View className="flex-row">
                      <View className="items-center mr-4">
                        <View
                          className={`w-11 h-11 rounded-full items-center justify-center shadow-elevated ${isCompleted
                              ? "bg-success"
                              : isLocked
                                ? "bg-surface-elevated"
                                : "bg-primary"
                            }`}
                        >
                          {isCompleted ? (
                            <MaterialCommunityIcons name="check" size={24} color="#ffffff" />
                          ) : isLocked ? (
                            <MaterialCommunityIcons name="lock" size={20} color="#7a86a8" />
                          ) : (
                            <Text className="text-background font-bold text-base">
                              {index + 1}
                            </Text>
                          )}
                        </View>
                        {index < exercises.length - 1 && (
                          <View className="w-0.5 h-16 bg-border/50 mt-2" />
                        )}
                      </View>

                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/(strength)/exercise-details",
                            params: { exerciseId: exercise.id },
                          })
                        }
                        className={`flex-1 card-frosted p-5 rounded-3xl shadow-elevated hover-scale ${isCompleted
                            ? "border-2 border-success/30"
                            : isLocked
                              ? "opacity-60"
                              : "border-2 border-primary/30"
                          }`}
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-text-primary font-bold text-lg flex-1">
                            {exercise.name}
                          </Text>
                          <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                        </View>
                        <Text className="text-text-secondary text-sm mb-3 leading-5">
                          {exercise.description}
                        </Text>
                        <View className="flex-row gap-2">
                          <View className="bg-surface-elevated px-3 py-1.5 rounded-lg">
                            <Text className="text-text-secondary text-xs">
                              {exercise.target.value}{" "}
                              {exercise.target.type === "reps" ? "reps" : "sec"}
                            </Text>
                          </View>
                          <View className="bg-surface-elevated px-3 py-1.5 rounded-lg">
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