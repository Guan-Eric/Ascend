import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Step4Screen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black justify-center items-center px-8">
      <View className="flex-1 justify-center items-center">
        <Text className="text-8xl mb-8">🚀</Text>
        <Text className="text-orange-500 text-5xl font-bold mb-4">
          AI Coaching
        </Text>
        <Text className="text-white text-2xl text-center mb-4 font-semibold">
          Personal Guidance
        </Text>
        <Text className="text-zinc-400 text-center text-lg leading-7">
          Get instant feedback, form corrections, and personalized workout
          recommendations from your AI coach
        </Text>
      </View>

      <View className="w-full mb-12">
        <Pressable
          onPress={() => router.push("/(onboarding)/paywall")}
          className="bg-orange-500 py-5 rounded-xl shadow-lg"
        >
          <Text className="text-black text-center font-bold text-lg">
            Get Started
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-zinc-500 text-center font-medium">Back</Text>
        </Pressable>

        <View className="flex-row justify-center mt-6 gap-2">
          <View className="w-2 h-2 bg-zinc-700 rounded-full" />
          <View className="w-2 h-2 bg-zinc-700 rounded-full" />
          <View className="w-2 h-2 bg-zinc-700 rounded-full" />
          <View className="w-8 h-2 bg-orange-500 rounded-full" />
        </View>
      </View>
    </View>
  );
}
