import { View, Text, ScrollView, Pressable } from "react-native";

export default function StrengthScreen() {
  const strengthPaths = [
    {
      name: "Push",
      exercises: ["Push-ups", "Dips", "Pike Push-ups"],
      color: "bg-red-500",
    },
    {
      name: "Pull",
      exercises: ["Pull-ups", "Rows", "Chin-ups"],
      color: "bg-blue-500",
    },
    {
      name: "Legs",
      exercises: ["Squats", "Lunges", "Pistol Squats"],
      color: "bg-green-500",
    },
    {
      name: "Core",
      exercises: ["Planks", "L-sits", "Hollow Holds"],
      color: "bg-yellow-500",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16">
        <Text className="text-orange-500 text-4xl font-bold mb-2">
          Strength Paths
        </Text>
        <Text className="text-zinc-400 mb-8 text-lg">
          Build functional strength across all movement patterns
        </Text>

        {strengthPaths.map((path, index) => (
          <Pressable
            key={index}
            className="bg-zinc-900 p-6 rounded-xl mb-4 border border-zinc-800"
          >
            <View className={`${path.color} w-20 h-1.5 rounded-full mb-4`} />

            <Text className="text-white text-2xl font-bold mb-3">
              {path.name}
            </Text>

            {path.exercises.map((exercise, idx) => (
              <Text key={idx} className="text-zinc-300 mb-1.5 text-base">
                • {exercise}
              </Text>
            ))}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
