import { View, Text, ScrollView, Pressable } from "react-native";

export default function StrengthScreen() {
  const strengthPaths = [
    {
      name: "Push",
      exercises: ["Push-ups", "Dips", "Pike Push-ups"],
      color: "bg-red-600",
    },
    {
      name: "Pull",
      exercises: ["Pull-ups", "Rows", "Chin-ups"],
      color: "bg-blue-600",
    },
    {
      name: "Legs",
      exercises: ["Squats", "Lunges", "Pistol Squats"],
      color: "bg-green-600",
    },
    {
      name: "Core",
      exercises: ["Planks", "L-sits", "Hollow Holds"],
      color: "bg-yellow-600",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16">
        <Text className="text-white text-3xl font-bold mb-2">
          Strength Paths
        </Text>
        <Text className="text-slate-400 mb-8">
          Build functional strength across all movement patterns
        </Text>

        {strengthPaths.map((path, index) => (
          <Pressable key={index} className="bg-slate-800 p-6 rounded-lg mb-4">
            <View className={`${path.color} w-16 h-1 rounded-full mb-3`} />

            <Text className="text-white text-2xl font-semibold mb-3">
              {path.name}
            </Text>

            {path.exercises.map((exercise, idx) => (
              <Text key={idx} className="text-slate-300 mb-1">
                • {exercise}
              </Text>
            ))}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
