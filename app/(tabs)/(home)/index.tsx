import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Today's Training
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Your personalized workout for today
        </Text>

        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">Warm Up</Text>
          <Text className="text-text-primary leading-6">
            • Wrist rotations - 10 reps{"\n"}• Shoulder circles - 10 reps{"\n"}•
            Cat-cow stretches - 10 reps
          </Text>
        </View>

        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">
            Main Workout
          </Text>
          <Text className="text-text-primary leading-6">
            • Push-ups - 3 sets of 12{"\n"}• Pull-ups - 3 sets of 8{"\n"}•
            Squats - 3 sets of 15{"\n"}• Plank - 3 sets of 45s
          </Text>
        </View>

        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-primary text-xl font-bold mb-3">Cool Down</Text>
          <Text className="text-text-primary leading-6">
            • Standing quad stretch - 30s each{"\n"}• Shoulder stretch - 30s
            each{"\n"}• Deep breathing - 2 minutes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
