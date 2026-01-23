import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as backend from "../../backend";
import { Skill } from "../../types/Skill";
import { useThemeColor } from "../../utils/theme";

export default function Step4Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [goalType, setGoalType] = useState<"skill" | "strength">("strength");
  const [primaryGoalId, setPrimaryGoalId] = useState("push_strength");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const primaryColor = useThemeColor('primary');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const loadedSkills = await backend.getAllSkills();
    const loadedPaths = await backend.getAllStrengthPaths();
    setSkills(loadedSkills);
    setStrengthPaths(loadedPaths);
  };

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/paywall",
      params: { ...params, goalType, primaryGoalId },
    });
  };

  const goals = goalType === "skill" ? skills : strengthPaths;

  return (
    <View className="flex-1 bg-background">
      <View className="px-8 pt-16 pb-6">
        <Pressable onPress={() => router.back()} className="mb-6 hover-scale self-start">
          <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
        </Pressable>

        <Text className="text-primary text-5xl font-bold mb-3">
          Choose Your Goal
        </Text>
        <Text className="text-text-secondary text-lg mb-6">
          What do you want to achieve?
        </Text>

        {/* Enhanced Goal Type Toggle */}
        <View className="bg-surface-elevated p-1.5 rounded-2xl shadow-elevated">
          <View className="flex-row">
            <Pressable
              onPress={() => {
                setGoalType("strength");
                setPrimaryGoalId("push_strength");
              }}
              className={`flex-1 py-4 rounded-xl transition-all ${goalType === "strength" ? "bg-primary shadow-lg" : ""
                }`}
            >
              <View className="items-center">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={24}
                  color={goalType === "strength" ? "#ffffff" : primaryColor}
                />
                <Text className={`font-bold mt-1 ${goalType === "strength" ? "text-background" : "text-text-secondary"
                  }`}>
                  Strength
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setGoalType("skill");
                setPrimaryGoalId(skills[0]?.id || "handstand");
              }}
              className={`flex-1 py-4 rounded-xl transition-all ${goalType === "skill" ? "bg-primary shadow-lg" : ""
                }`}
            >
              <View className="items-center">
                <MaterialCommunityIcons
                  name="medal"
                  size={24}
                  color={goalType === "skill" ? "#ffffff" : primaryColor}
                />
                <Text className={`font-bold mt-1 ${goalType === "skill" ? "text-background" : "text-text-secondary"
                  }`}>
                  Skills
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Goals List */}
      <FlashList
        className="flex-1 px-8"
        data={goals}
        renderItem={({ item: goal }) => (
          <Pressable
            onPress={() => setPrimaryGoalId(goal.id)}
            className={`card-frosted p-6 rounded-3xl mb-3 shadow-elevated hover-scale border-2 ${primaryGoalId === goal.id ? "border-primary bg-primary/5" : "border-transparent"
              }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className={`text-lg font-bold mb-1 ${primaryGoalId === goal.id ? "text-primary" : "text-text-primary"
                  }`}>
                  {goal.name}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {goal.description}
                </Text>
              </View>

              <View className={`w-10 h-10 rounded-full items-center justify-center ${primaryGoalId === goal.id ? "bg-primary" : "bg-surface-elevated"
                }`}>
                {primaryGoalId === goal.id ? (
                  <MaterialCommunityIcons name="check" size={24} color="#ffffff" />
                ) : (
                  <MaterialCommunityIcons name="plus" size={24} color={primaryColor} />
                )}
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="px-8 pb-12">
        <Pressable
          onPress={handleContinue}
          className="bg-primary py-6 rounded-2xl shadow-elevated-lg hover-scale mb-6"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-background text-center font-bold text-xl">
              Complete Setup
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color={primaryColor} />
          </View>
        </Pressable>

        <View className="flex-row justify-center gap-2">
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-10 h-2 bg-primary rounded-full" />
        </View>
      </View>
    </View>
  );
}