// app/(onboarding)/step3.tsx - Training Frequency
import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Step3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [trainingDays, setTrainingDays] = useState(3);

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/step4",
      params: { ...params, trainingDays },
    });
  };

  return (
    <View className="flex-1 bg-background px-8">
      <View className="flex-1 justify-center">
        <Text className="text-primary text-4xl font-bold mb-3">
          Training Frequency
        </Text>
        <Text className="text-text-secondary text-lg mb-8">
          How many days per week can you train?
        </Text>

        <View className="card-frosted p-8 rounded-3xl shadow-elevated mb-6">
          <Text className="text-text-primary text-6xl font-bold text-center mb-4">
            {trainingDays}
          </Text>
          <Text className="text-text-secondary text-center text-lg mb-6">
            {trainingDays === 1 ? "day" : "days"} per week
          </Text>

          <View className="flex-row items-center justify-center gap-4">
            <Pressable
              onPress={() => setTrainingDays(Math.max(1, trainingDays - 1))}
              className="bg-surface-elevated w-14 h-14 rounded-2xl items-center justify-center hover-scale"
            >
              <MaterialCommunityIcons name="minus" size={28} color="#00d9ff" />
            </Pressable>

            <View className="bg-primary/10 px-6 py-2 rounded-xl">
              <Text className="text-primary text-sm font-bold">ADJUST</Text>
            </View>

            <Pressable
              onPress={() => setTrainingDays(Math.min(7, trainingDays + 1))}
              className="bg-surface-elevated w-14 h-14 rounded-2xl items-center justify-center hover-scale"
            >
              <MaterialCommunityIcons name="plus" size={28} color="#00d9ff" />
            </Pressable>
          </View>
        </View>

        <View className="bg-surface-elevated/50 p-4 rounded-2xl">
          <Text className="text-text-secondary text-sm text-center">
            💡 We recommend 3-5 days per week for optimal progress
          </Text>
        </View>
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
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}
