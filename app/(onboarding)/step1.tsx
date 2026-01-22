// app/(onboarding)/step1.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Step1Screen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background justify-center items-center px-8">
      <View className="flex-1 justify-center items-center">
        <Text className="text-primary text-4xl font-bold mb-4">
          Welcome to Ascend
        </Text>
        <Text className="text-text-primary text-2xl text-center mb-4 font-semibold">
          Transform Your Body
        </Text>
        <Text className="text-text-secondary text-center text-lg leading-7">
          Master calisthenics skills and build incredible strength using just
          your bodyweight
        </Text>
      </View>

      <View className="w-full mb-12">
        <Pressable
          onPress={() => router.push("/(onboarding)/step2")}
          className="bg-primary py-5 rounded-xl shadow-lg hover-scale"
        >
          <Text className="text-background text-center font-bold text-lg">
            Let's Get Started
          </Text>
        </Pressable>

        <View className="flex-row justify-center mt-6 gap-2">
          <View className="w-8 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}