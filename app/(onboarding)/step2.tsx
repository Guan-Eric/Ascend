import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Step2Screen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background justify-center items-center px-8">
      <View className="flex-1 justify-center items-center">
        <Text className="text-primary text-4xl font-bold mb-4">
          Set Your Goals
        </Text>
        <Text className="text-text-primary text-2xl text-center mb-4 font-semibold">
          Progressive Training
        </Text>
        <Text className="text-text-secondary text-center text-lg leading-7">
          From beginner to advanced, we'll guide you through every progression
          to master impressive skills
        </Text>
      </View>

      <View className="w-full mb-12">
        <Pressable
          onPress={() => router.push("/(onboarding)/step3")}
          className="bg-primary py-5 rounded-xl shadow-lg"
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
