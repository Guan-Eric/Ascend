// app/(onboarding)/step4.tsx - Goal Selection
import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as backend from "../../backend";
import { Skill } from "../../types/Skill";

export default function Step4Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [goalType, setGoalType] = useState<"skill" | "strength">("strength");
  const [primaryGoalId, setPrimaryGoalId] = useState("push_strength");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);

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
      <View className="px-8 pt-16 pb-4">
        <Text className="text-primary text-4xl font-bold mb-3">
          Choose Your Goal
        </Text>
        <Text className="text-text-secondary text-lg mb-4">
          What do you want to achieve?
        </Text>

        {/* Goal Type Toggle */}
        <View className="flex-row bg-surface-elevated p-1 rounded-2xl">
          <Pressable
            onPress={() => {
              setGoalType("strength");
              setPrimaryGoalId("push_strength");
            }}
            className={`flex-1 py-3 rounded-xl ${goalType === "strength" ? "bg-primary" : ""
              }`}
          >
            <Text
              className={`text-center font-bold ${goalType === "strength" ? "text-background" : "text-text-secondary"
                }`}
            >
              Strength
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setGoalType("skill");
              setPrimaryGoalId(skills[0]?.id || "handstand");
            }}
            className={`flex-1 py-3 rounded-xl ${goalType === "skill" ? "bg-primary" : ""
              }`}
          >
            <Text
              className={`text-center font-bold ${goalType === "skill" ? "text-background" : "text-text-secondary"
                }`}
            >
              Skills
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Goals List with FlashList */}
      <FlashList
        className="flex-1 px-8"
        data={goals}
        renderItem={({ item: goal }) => (
          <Pressable
            onPress={() => setPrimaryGoalId(goal.id)}
            className={`card-frosted p-5 rounded-3xl mb-3 shadow-elevated hover-scale border-2 ${primaryGoalId === goal.id ? " border-primary" : ""
              }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-text-primary text-lg font-bold mb-1">
                  {goal.name}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {goal.description}
                </Text>
              </View>
              {primaryGoalId === goal.id ? (
                <MaterialCommunityIcons name="check-circle" size={24} color="#00d9ff" />
              ) : <MaterialCommunityIcons name="check-circle" size={24} color="transparent" />}
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="px-8 mb-12">
        <Pressable
          onPress={handleContinue}
          className="bg-primary py-5 rounded-xl shadow-lg hover-scale"
        >
          <Text className="text-background text-center font-bold text-lg">
            Complete Setup
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-text-muted text-center font-medium">Back</Text>
        </Pressable>

        <View className="flex-row justify-center mt-6 gap-2">
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
        </View>
      </View>
    </View>
  );
}