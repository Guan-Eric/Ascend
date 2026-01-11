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
import { Skill } from "../../../types/Skill";
import { Exercise } from "../../../types/Exercise";

export default function StrengthScreen() {
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const [pathExercises, setPathExercises] = useState<
    Record<string, Exercise[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrengthPaths();
  }, []);

  const loadStrengthPaths = async () => {
    try {
      // Load all strength paths
      const paths = await backend.getAllStrengthPaths();
      setStrengthPaths(paths);

      // Load first 3 exercises for each path (for preview)
      const exercisesMap: Record<string, Exercise[]> = {};

      for (const path of paths) {
        const firstThreeIds = path.progression
          .slice(0, 3)
          .map((p) => p.exerciseId);
        const exercises = await backend.getExercisesByIds(firstThreeIds);
        exercisesMap[path.id] = exercises;
      }

      setPathExercises(exercisesMap);
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

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#38e8ff" />
        <Text className="text-text-secondary mt-4">
          Loading strength paths...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Strength Paths
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Build functional strength across all movement patterns
        </Text>

        {strengthPaths.length === 0 && (
          <View className="bg-surface p-6 rounded-xl border border-border">
            <Text className="text-text-primary text-center">
              No strength paths available. Please seed your database.
            </Text>
          </View>
        )}

        {strengthPaths.map((path) => {
          const exercises = pathExercises[path.id] || [];

          return (
            <Pressable
              key={path.id}
              className="bg-surface p-6 rounded-xl mb-4 border border-border"
            >
              <View
                className={`${getPathColor(
                  path.id
                )} w-20 h-1.5 rounded-full mb-4`}
              />

              <Text className="text-text-primary text-2xl font-bold mb-2">
                {path.name}
              </Text>

              <Text className="text-text-secondary text-sm mb-4">
                {path.description}
              </Text>

              <View className="bg-surface-elevated p-4 rounded-lg">
                <Text className="text-text-secondary text-xs font-semibold mb-2 uppercase">
                  Exercise Preview
                </Text>
                {exercises.map((exercise, idx) => (
                  <Text
                    key={exercise.id}
                    className="text-text-primary mb-1.5 text-base"
                  >
                    • {exercise.name}
                  </Text>
                ))}
                {path.progression.length > 3 && (
                  <Text className="text-text-muted text-sm mt-2">
                    + {path.progression.length - 3} more exercises
                  </Text>
                )}
              </View>

              <View className="mt-4 flex-row items-center">
                <Text className="text-text-muted text-sm">
                  {path.progression.length} total exercises
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
