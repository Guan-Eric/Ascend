import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Step4Screen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background justify-center items-center px-8">
      <View className="flex-1 justify-center items-center">
        <Text className="text-8xl mb-8">🚀</Text>
        <Text className="text-primary text-5xl font-bold mb-4">
          AI Coaching
        </Text>
        <Text className="text-text-primary text-2xl text-center mb-4 font-semibold">
          Personal Guidance
        </Text>
        <Text className="text-text-secondary text-center text-lg leading-7">
          Get instant feedback, form corrections, and personalized workout
          recommendations from your AI coach
        </Text>
      </View>

      <View className="w-full mb-12">
        <Pressable
          onPress={() => router.push("/(onboarding)/paywall")}
          className="bg-primary py-5 rounded-xl shadow-lg"
        >
          <Text className="text-background text-center font-bold text-lg">
            Get Started
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
