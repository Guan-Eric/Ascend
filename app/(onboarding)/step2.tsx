// app/(onboarding)/step2.tsx - Experience Level
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Step2Screen() {
  const router = useRouter();
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const levels = [
    {
      value: "beginner" as const,
      label: "Beginner",
      description: "New to calisthenics or working out",
      icon: "sprout",
    },
    {
      value: "intermediate" as const,
      label: "Intermediate",
      description: "Can do push-ups and pull-ups",
      icon: "run-fast",
    },
    {
      value: "advanced" as const,
      label: "Advanced",
      description: "Training for advanced skills",
      icon: "trophy",
    },
  ];

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/step3",
      params: { level },
    });
  };

  return (
    <View className="flex-1 bg-background px-8">
      <View className="flex-1 justify-center">
        <Text className="text-primary text-4xl font-bold mb-3">
          Experience Level
        </Text>
        <Text className="text-text-secondary text-lg mb-8">
          Choose your current fitness level
        </Text>

        {levels.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setLevel(item.value)}
            className={`card-frosted p-6 rounded-3xl mb-4 shadow-elevated hover-scale border-2 ${level === item.value ? " border-primary" : ""
              }`}
          >
            <View className="flex-row items-center mb-2">
              <View className="bg-primary/10 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <MaterialCommunityIcons name={item.icon as any} size={24} color="#00d9ff" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-xl font-bold mb-1">
                  {item.label}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {item.description}
                </Text>
              </View>
              {level === item.value ? (
                <MaterialCommunityIcons name="check-circle" size={24} color="#00d9ff" />
              ) : <MaterialCommunityIcons name="check-circle" size={24} color="transparent" />}
            </View>
          </Pressable>
        ))}
      </View>

      <View className="w-full mb-12">
        <Pressable
          onPress={handleContinue}
          className="bg-primary py-5 rounded-xl shadow-lg hover-scale"
        >
          <Text className="text-background text-center font-bold text-lg">
            Continue
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-text-muted text-center font-medium">Back</Text>
        </Pressable>

        <View className="flex-row justify-center mt-6 gap-2">
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}