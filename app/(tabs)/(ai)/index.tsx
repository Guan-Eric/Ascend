import { View, Text, ScrollView } from "react-native";

export default function AIScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">AI Coach</Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Your personal calisthenics guide
        </Text>

        <View
          className="bg-surface p-6 rounded-xl items-center justify-center border border-border"
          style={{ minHeight: 400 }}
        >
          <Text className="text-7xl mb-6">🤖</Text>
          <Text className="text-text-primary text-2xl font-bold mb-3">
            Coming Soon
          </Text>
          <Text className="text-text-secondary text-center leading-6 text-base">
            Your AI-powered coach will help you perfect your form, suggest
            progressions, and answer all your calisthenics questions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
