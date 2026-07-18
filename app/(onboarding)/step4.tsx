import { View, Text, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../../config/firebase";
import * as backend from "../../backend";
import { Skill } from "../../types/Skill";
import { useThemeColor } from "../../utils/theme";
import { AnimatedPressable } from "../../components/AnimatedPressable";
import { logOnboardingStepCompleted } from "../../utils/analytics";

export default function Step4Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [goalType, setGoalType] = useState<"skill" | "strength">("strength");
  const [primaryGoalId, setPrimaryGoalId] = useState("push_strength");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const primaryColor = useThemeColor("primary");

  const level =
    (params.level as "beginner" | "intermediate" | "advanced") || "beginner";
  const trainingDays = parseInt(params.trainingDays as string) || 3;

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const loadedSkills = await backend.getAllSkills();
    const loadedPaths = await backend.getAllStrengthPaths();
    setSkills(loadedSkills);
    setStrengthPaths(loadedPaths);
  };

  const handleContinue = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      logOnboardingStepCompleted({
        step: 4,
        goalType,
        primaryGoalId,
      });

      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert("Error", "Please sign in again to continue.");
        setSubmitting(false);
        return;
      }

      await backend.initializeUser(user.uid, {
        email: user.email ?? "",
        goalType,
        primaryGoalId,
        level,
        trainingDaysPerWeek: trainingDays,
      });

      await backend.generateSamplePlan(user.uid);

      router.replace("/(tabs)/(home)");
    } catch (error) {
      console.error("Error finishing onboarding:", error);
      Alert.alert("Error", "Failed to set up your sample workout. Please try again.");
      setSubmitting(false);
    }
  };

  const goals = goalType === "skill" ? skills : strengthPaths;

  return (
    <View className="flex-1 bg-background">
      <View className="px-8 pt-16 pb-6">
        <View className="flex-row mb-4 items-center gap-2">
          <AnimatedPressable onPress={() => router.back()} className=" self-start">
            <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
          </AnimatedPressable>

          <Text className="text-primary text-3xl font-bold">
            Choose Your Goal
          </Text>
        </View>
        <Text className="text-text-secondary text-lg mb-6">
          What do you want to achieve?
        </Text>

        <View className="bg-surface-elevated p-1.5 rounded-2xl shadow-elevated">
          <View className="flex-row">
            <Pressable
              onPress={() => {
                setGoalType("strength");
                setPrimaryGoalId(strengthPaths[0]?.id || "core_strength");
              }}
              className={`flex-1 py-4 rounded-xl transition-all ${
                goalType === "strength" ? "bg-primary shadow-lg" : ""
              }`}
            >
              <View className="items-center">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={24}
                  color={goalType === "strength" ? "#ffffff" : primaryColor}
                />
                <Text
                  className={`font-bold mt-1 ${
                    goalType === "strength"
                      ? "text-background"
                      : "text-text-secondary"
                  }`}
                >
                  Strength
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setGoalType("skill");
                setPrimaryGoalId(skills[0]?.id || "handstand");
              }}
              className={`flex-1 py-4 rounded-xl transition-all ${
                goalType === "skill" ? "bg-primary shadow-lg" : ""
              }`}
            >
              <View className="items-center">
                <MaterialCommunityIcons
                  name="medal"
                  size={24}
                  color={goalType === "skill" ? "#ffffff" : primaryColor}
                />
                <Text
                  className={`font-bold mt-1 ${
                    goalType === "skill"
                      ? "text-background"
                      : "text-text-secondary"
                  }`}
                >
                  Skills
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <FlashList
        className="flex-1 px-8"
        data={goals}
        renderItem={({ item: goal }) => (
          <AnimatedPressable
            onPress={() => setPrimaryGoalId(goal.id)}
            className={`card-frosted p-6 rounded-3xl mb-3 shadow-elevated border-2 ${
              primaryGoalId === goal.id
                ? "border-primary bg-primary/5"
                : "border-transparent"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text
                  className={`text-lg font-bold mb-1 ${
                    primaryGoalId === goal.id
                      ? "text-primary"
                      : "text-text-primary"
                  }`}
                >
                  {goal.name}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {goal.description}
                </Text>
              </View>

              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  primaryGoalId === goal.id ? "bg-primary" : "bg-surface-elevated"
                }`}
              >
                {primaryGoalId === goal.id ? (
                  <MaterialCommunityIcons name="check" size={24} color="#ffffff" />
                ) : (
                  <MaterialCommunityIcons name="plus" size={24} color={primaryColor} />
                )}
              </View>
            </View>
          </AnimatedPressable>
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="px-8 pb-12">
        <AnimatedPressable
          onPress={handleContinue}
          disabled={submitting}
          className={`bg-primary py-4 rounded-2xl shadow-elevated-lg mb-6 ${
            submitting ? "opacity-50" : ""
          }`}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-background text-center font-bold text-xl">
              {submitting ? "Building your workout..." : "Try Your First Workout"}
            </Text>
          </View>
        </AnimatedPressable>

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
