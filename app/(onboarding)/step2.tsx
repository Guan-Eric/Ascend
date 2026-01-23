import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../utils/theme";
import { AnimatedPressable } from "../../components/AnimatedPressable";

export default function Step2Screen() {
  const router = useRouter();
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const primaryColor = useThemeColor('primary');

  const levels = [
    {
      value: "beginner" as const,
      label: "Beginner",
      description: "New to calisthenics or working out",
      icon: "sprout",
      iconColor: "#10b981",
    },
    {
      value: "intermediate" as const,
      label: "Intermediate",
      description: "Can do push-ups and pull-ups",
      icon: "run-fast",
      iconColor: "#f59e0b",
    },
    {
      value: "advanced" as const,
      label: "Advanced",
      description: "Training for advanced skills",
      icon: "trophy",
      iconColor: "#8b5cf6",
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
      {/* Header */}
      <View className="pt-16 pb-8">
        <View className="flex-row items-center gap-2 mb-2"> <AnimatedPressable onPress={() => router.back()} className="self-start">
          <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
        </AnimatedPressable>

          <Text className="text-primary text-4xl font-bold">
            Experience Level
          </Text></View>
        <Text className="text-text-secondary text-lg">
          Choose your current fitness level
        </Text>
      </View>

      {/* Level Cards */}
      <View className="flex-1 justify-center">
        {levels.map((item) => (
          <AnimatedPressable
            key={item.value}
            onPress={() => setLevel(item.value)}
            className={`card-frosted p-6 rounded-3xl mb-4 shadow-elevated hover-scale border-2 ${level === item.value ? "border-primary" : "border-transparent"
              }`}
          >
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-2xl items-center justify-center mr-4 ${level === item.value ? "bg-primary" : "bg-surface-elevated"
                }`}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={32}
                  color={level === item.value ? "#ffffff" : item.iconColor}
                />
              </View>

              <View className="flex-1">
                <Text className={`text-xl font-bold mb-1 ${level === item.value ? "text-primary" : "text-text-primary"
                  }`}>
                  {item.label}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {item.description}
                </Text>
              </View>

              {level === item.value ? (
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <MaterialCommunityIcons name="check" size={20} color="#ffffff" />
                </View>
              ) : <View className="w-8 h-8 bg-background rounded-full items-center justify-center">
                <MaterialCommunityIcons name="check" size={20} color="transparent" />
              </View>}
            </View>
          </AnimatedPressable>
        ))}
      </View>

      {/* Footer */}
      <View className="pb-12">
        <AnimatedPressable
          onPress={handleContinue}
          className="bg-primary py-4 rounded-2xl shadow-elevated-lg mb-6"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-background text-center font-bold text-xl">
              Continue
            </Text>
          </View>
        </AnimatedPressable>

        <View className="flex-row justify-center gap-2">
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-10 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}