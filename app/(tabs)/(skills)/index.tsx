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
        <ActivityIndicator size="large" color="#38e8ff" />
        <Text className="text-text-secondary mt-4">Loading skills...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Skill Progressions
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Master advanced calisthenics movements
        </Text>

        {skills.length === 0 && (
          <View className="bg-surface p-6 rounded-xl border border-border">
            <Text className="text-text-primary text-center">
              No skills available. Please seed your database.
            </Text>
          </View>
        )}

        {skills.map((skill) => {
          const progress = progressMap[skill.id] || 0;
          const minLevel = skill.unlockCriteria?.minLevel || "beginner";

          return (
            <Pressable
              key={skill.id}
              className="bg-surface p-6 rounded-xl mb-4 border border-border"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-text-primary text-xl font-bold flex-1">
                  {skill.name}
                </Text>
                <View
                  className={`${getLevelBadgeColor(
                    skill.id
                  )} px-3 py-1 rounded-full`}
                >
                  <Text className="text-background text-xs font-bold uppercase">
                    {minLevel}
                  </Text>
                </View>
              </View>

              <Text className="text-text-secondary text-sm mb-3">
                {skill.description}
              </Text>

              <View className="bg-surface-elevated h-3 rounded-full overflow-hidden">
                <View
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>

              <Text className="text-text-secondary text-sm mt-2 font-medium">
                {progress}% complete • {skill.progression.length} exercises
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
