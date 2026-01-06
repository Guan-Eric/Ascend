import { View, Text, ScrollView } from "react-native";

export default function AIScreen() {
  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16">
        <Text className="text-orange-500 text-4xl font-bold mb-2">
          AI Coach
        </Text>
        <Text className="text-zinc-400 mb-8 text-lg">
          Your personal calisthenics guide
        </Text>

        <View
          className="bg-zinc-900 p-6 rounded-xl items-center justify-center border border-zinc-800"
          style={{ minHeight: 400 }}
        >
          <Text className="text-7xl mb-6">🤖</Text>
          <Text className="text-white text-2xl font-bold mb-3">
            Coming Soon
          </Text>
          <Text className="text-zinc-400 text-center leading-6 text-base">
            Your AI-powered coach will help you perfect your form, suggest
            progressions, and answer all your calisthenics questions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
