import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Skill } from "../../../types/Skill";
import { Exercise } from "../../../types/Exercise";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import { Screen, SegmentControl } from "../../../components/ui";

type ProgressSegment = "skills" | "strength";

export default function ProgressScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<ProgressSegment>("skills");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const [pathExercises, setPathExercises] = useState<Record<string, Exercise[]>>(
    {}
  );
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const [allSkills, paths, completed] = await Promise.all([
        backend.getAllSkills(),
        backend.getAllStrengthPaths(),
        backend.getCompletedExerciseIds(userId),
      ]);

      setSkills(allSkills);
      setStrengthPaths(paths);
      setCompletedIds(completed);

      const progressData: Record<string, number> = {};
      for (const skill of allSkills) {
        progressData[skill.id] = await backend.getSkillProgress(
          skill.id,
          completed
        );
      }
      setProgressMap(progressData);

      const exercisesMap: Record<string, Exercise[]> = {};
      for (const path of paths) {
        const pathData = await backend.getStrengthPathWithExercises(path.id);
        if (pathData) exercisesMap[path.id] = pathData.exercises;
      }
      setPathExercises(exercisesMap);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPathProgress = (pathId: string) => {
    const exercises = pathExercises[pathId] || [];
    if (exercises.length === 0) return 0;
    const done = exercises.filter((ex) => completedIds.includes(ex.id)).length;
    return Math.round((done / exercises.length) * 100);
  };

  if (loading) {
    return (
      <Screen className="justify-center items-center" padded={false}>
        <LoadingSpinner size={56} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={["top"]}>
      <View className="px-6 mb-4">
        <Text className="text-text-primary text-[28px] font-sans-semibold mb-1">
          Progress
        </Text>
        <Text className="text-text-muted text-[15px] font-sans mb-5">
          Explore skills and strength paths
        </Text>
        <SegmentControl
          options={[
            { value: "skills" as const, label: "Skills" },
            { value: "strength" as const, label: "Strength" },
          ]}
          value={segment}
          onChange={setSegment}
        />
      </View>

      <FlashList
        className="flex-1 px-6"
        data={segment === "skills" ? skills : strengthPaths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 112 }}
        ListEmptyComponent={
          <Text className="text-text-muted font-sans text-[15px] mt-8 text-center">
            Nothing here yet. Seed your catalog to browse.
          </Text>
        }
        renderItem={({ item, index }) => {
          if (segment === "skills") {
            const progress = progressMap[item.id] || 0;
            const minLevel = item.unlockCriteria?.minLevel || "beginner";
            return (
              <FadeSlideIn delay={Math.min(index * 40, 200)}>
                <AnimatedPressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(skills)/skill-details",
                      params: { skillId: item.id },
                    })
                  }
                  className="py-5 border-b border-border"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 pr-3">
                      <Text className="text-text-primary text-[17px] font-sans-semibold mb-1">
                        {item.name}
                      </Text>
                      <Text className="text-text-muted text-[13px] font-sans-medium capitalize">
                        {minLevel}
                      </Text>
                    </View>
                    <Text className="text-primary font-sans-semibold text-[15px]">
                      {progress}%
                    </Text>
                  </View>
                  <Text
                    className="text-text-secondary text-[14px] font-sans mb-3 leading-5"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <View className="bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                    <View
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </AnimatedPressable>
              </FadeSlideIn>
            );
          }

          const exercises = pathExercises[item.id] || [];
          const progress = getPathProgress(item.id);
          return (
            <FadeSlideIn delay={Math.min(index * 40, 200)}>
              <AnimatedPressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(strength)/path-details",
                    params: { pathId: item.id },
                  })
                }
                className="py-5 border-b border-border"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-text-primary text-[17px] font-sans-semibold flex-1 pr-3">
                    {item.name}
                  </Text>
                  <Text className="text-primary font-sans-semibold text-[15px]">
                    {progress}%
                  </Text>
                </View>
                <Text
                  className="text-text-secondary text-[14px] font-sans mb-3 leading-5"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
                <View className="bg-surface-elevated h-1.5 rounded-full overflow-hidden mb-3">
                  <View
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={14}
                    color={mutedColor}
                  />
                  <Text className="text-text-muted text-[13px] font-sans ml-1.5">
                    {exercises.length} exercises
                  </Text>
                  {progress === 100 && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color={successColor}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </AnimatedPressable>
            </FadeSlideIn>
          );
        }}
      />
    </Screen>
  );
}
