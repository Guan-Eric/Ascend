import { View, Text, ScrollView } from "react-native";

export default function AIScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16">
        <Text className="text-white text-3xl font-bold mb-2">AI Coach</Text>
        <Text className="text-slate-400 mb-8">
          Your personal calisthenics guide
        </Text>

        <View
          className="bg-slate-800 p-6 rounded-lg items-center justify-center"
          style={{ minHeight: 400 }}
        >
          <Text className="text-6xl mb-4">🤖</Text>
          <Text className="text-white text-xl font-semibold mb-2">
            Coming Soon
          </Text>
          <Text className="text-slate-400 text-center">
            Your AI-powered coach will help you perfect your form, suggest
            progressions, and answer all your calisthenics questions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
