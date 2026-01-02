import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16">
        <Text className="text-white text-3xl font-bold mb-2">
          Today's Training
        </Text>
        <Text className="text-slate-400 mb-8">
          Your personalized workout for today
        </Text>

        <View className="bg-slate-800 p-6 rounded-lg mb-4">
          <Text className="text-white text-xl font-semibold mb-2">Warm Up</Text>
          <Text className="text-slate-300">
            • Wrist rotations - 10 reps{"\n"}• Shoulder circles - 10 reps{"\n"}•
            Cat-cow stretches - 10 reps
          </Text>
        </View>

        <View className="bg-slate-800 p-6 rounded-lg mb-4">
          <Text className="text-white text-xl font-semibold mb-2">
            Main Workout
          </Text>
          <Text className="text-slate-300">
            • Push-ups - 3 sets of 12{"\n"}• Pull-ups - 3 sets of 8{"\n"}•
            Squats - 3 sets of 15{"\n"}• Plank - 3 sets of 45s
          </Text>
        </View>

        <View className="bg-slate-800 p-6 rounded-lg mb-4">
          <Text className="text-white text-xl font-semibold mb-2">
            Cool Down
          </Text>
          <Text className="text-slate-300">
            • Standing quad stretch - 30s each{"\n"}• Shoulder stretch - 30s
            each{"\n"}• Deep breathing - 2 minutes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
