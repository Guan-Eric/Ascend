import { View, Text, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Skill } from "../../../types/Skill";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

export default function SkillsScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      // Load all skills
      const allSkills = await backend.getAllSkills();
      setSkills(allSkills);

      // Load user's progress for each skill
      const completedIds = await backend.getCompletedExerciseIds(userId);
      const progressData: Record<string, number> = {};

      for (const skill of allSkills) {
        const progress = await backend.getSkillProgress(skill.id, completedIds);
        progressData[skill.id] = progress;
      }

      setProgressMap(progressData);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeColor = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill?.unlockCriteria?.minLevel) return "bg-success";

    switch (skill.unlockCriteria.minLevel) {
      case "beginner":
        return "bg-success";
      case "intermediate":
        return "bg-warning";
      case "advanced":
        return "bg-error";
      default:
        return "bg-success";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
        <Text className="text-text-secondary mt-4">Loading skills...</Text>
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
            <Text className="text-primary text-4xl font-bold mb-2">
              Skill Progressions
            </Text>
            <Text className="text-text-secondary mb-8 text-lg">
              Master advanced calisthenics movements
            </Text>

            {skills.length === 0 && (
              <View className="card-frosted p-8 rounded-3xl border border-border">
                <Text className="text-text-primary text-center">
                  No skills available. Please seed your database.
                </Text>
              </View>
            )}

            {skills.map((skill) => {
              const progress = progressMap[skill.id] || 0;
              const minLevel = skill.unlockCriteria?.minLevel || "beginner";

              return (
                <AnimatedPressable
                  key={skill.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(skills)/skill-details",
                      params: { skillId: skill.id },
                    })
                  }
                  className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated "
                >
                  <View className="flex-row items-center mb-4">

                    <View className="flex-1">
                      <Text className="text-text-primary text-xl font-bold mb-1">
                        {skill.name}
                      </Text>
                      <View
                        className={`${getLevelBadgeColor(
                          skill.id
                        )} px-3 py-1 rounded-full self-start`}
                      >
                        <Text className="text-background text-xs font-bold uppercase">
                          {minLevel}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-text-secondary text-sm mb-4 leading-5">
                    {skill.description}
                  </Text>

                  <View className="bg-surface-elevated/50 h-3 rounded-full overflow-hidden mb-2">
                    <View
                      className="bg-primary h-full rounded-full shadow-elevated"
                      style={{ width: `${progress}%` }}
                    />
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-text-secondary text-sm font-medium">
                      {progress}% complete
                    </Text>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="dumbbell" size={14} color="#94a3b8" />
                      <Text className="text-text-muted text-xs ml-1">
                        {skill.progression.length} exercises
                      </Text>
                    </View>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </>
      )}
    />
  );
}
