import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-8">
      <Text className="text-white text-5xl font-bold mb-4">Ascend</Text>
      <Text className="text-slate-300 text-xl mb-2">Calisthenics</Text>
      <Text className="text-slate-400 text-center mb-12">
        Master bodyweight skills and build strength
      </Text>

      <Pressable
        onPress={() => router.push("/(auth)/signup")}
        className="w-full bg-blue-600 py-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Get Started
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/signin")}
        className="w-full border border-slate-600 py-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Sign In
        </Text>
      </Pressable>
    </View>
  );
}
