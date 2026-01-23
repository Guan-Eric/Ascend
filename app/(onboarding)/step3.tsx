import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../utils/theme";
import { AnimatedPressable } from "../../components/AnimatedPressable";

export default function Step3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [trainingDays, setTrainingDays] = useState(3);
  const primaryColor = useThemeColor('primary');

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/step4",
      params: { ...params, trainingDays },
    });
  };

  const recommendations = [
    { days: 2, label: "Light", description: "Maintain fitness" },
    { days: 3, label: "Optimal", description: "Recommended for growth" },
    { days: 4, label: "Intense", description: "Fast progress" },
    { days: 5, label: "Advanced", description: "For experienced athletes" },
  ];

  return (
    <View className="flex-1 bg-background px-8">
      <View className="pt-16 pb-8">
        <View className="flex-row mb-4 items-center gap-2">
          <AnimatedPressable onPress={() => router.back()} className=" self-start">
            <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
          </AnimatedPressable>

          <Text className="text-primary text-4xl font-bold ">
            Training Days
          </Text></View>
        <Text className="text-text-secondary text-lg">
          How often can you train per week?
        </Text>
      </View>

      <View className="flex-1 justify-center">
        {/* Counter Display */}
        <View className="card-frosted p-4 rounded-3xl shadow-elevated-lg mb-4">
          <View className="items-center mb-8">
            <Text className="text-primary text-8xl font-bold mb-2">
              {trainingDays}
            </Text>
            <Text className="text-text-secondary text-xl">
              {trainingDays === 1 ? "day" : "days"} per week
            </Text>
          </View>

          <View className="flex-row items-center justify-center gap-6">
            <AnimatedPressable
              onPress={() => setTrainingDays(Math.max(1, trainingDays - 1))}
              className="bg-surface-elevated w-16 h-16 rounded-2xl items-center justify-center shadow-elevated"
            >
              <MaterialCommunityIcons name="minus" size={32} color={primaryColor} />
            </AnimatedPressable>

            <View className="bg-primary px-8 py-3 rounded-2xl">
              <Text className="text-background text-sm font-bold">ADJUST</Text>
            </View>

            <AnimatedPressable
              onPress={() => setTrainingDays(Math.min(7, trainingDays + 1))}
              className="bg-surface-elevated w-16 h-16 rounded-2xl items-center justify-center shadow-elevated"
            >
              <MaterialCommunityIcons name="plus" size={32} color={primaryColor} />
            </AnimatedPressable>
          </View>
        </View>

        {/* Recommendation Cards */}
        <View className="bg-surface-elevated/50 p-5 rounded-2xl">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="lightbulb" size={20} color={primaryColor} />
            <Text className="text-text-primary text-sm font-semibold ml-2">
              Recommendations
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {recommendations.map((rec) => (
              <AnimatedPressable
                key={rec.days}
                onPress={() => setTrainingDays(rec.days)}
                className={`px-4 py-2 rounded-xl border ${trainingDays === rec.days
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
                  }`}
              >
                <Text className={`text-xs font-bold ${trainingDays === rec.days ? "text-background" : "text-text-secondary"
                  }`}>
                  {rec.days}x • {rec.label}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      </View>

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
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-10 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}