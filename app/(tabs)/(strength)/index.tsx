import { View, Text, ScrollView, Pressable } from "react-native";

export default function StrengthScreen() {
  const strengthPaths = [
    {
      name: "Push",
      exercises: ["Push-ups", "Dips", "Pike Push-ups"],
      color: "bg-error",
    },
    {
      name: "Pull",
      exercises: ["Pull-ups", "Rows", "Chin-ups"],
      color: "bg-secondary",
    },
    {
      name: "Legs",
      exercises: ["Squats", "Lunges", "Pistol Squats"],
      color: "bg-success",
    },
    {
      name: "Core",
      exercises: ["Planks", "L-sits", "Hollow Holds"],
      color: "bg-warning",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Strength Paths
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Build functional strength across all movement patterns
        </Text>

        {strengthPaths.map((path, index) => (
          <Pressable
            key={index}
            className="bg-surface p-6 rounded-xl mb-4 border border-border"
          >
            <View className={`${path.color} w-20 h-1.5 rounded-full mb-4`} />

            <Text className="text-text-primary text-2xl font-bold mb-3">
              {path.name}
            </Text>

            {path.exercises.map((exercise, idx) => (
              <Text key={idx} className="text-text-secondary mb-1.5 text-base">
                • {exercise}
              </Text>
            ))}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
