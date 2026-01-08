import { View, Text, ScrollView, Pressable } from "react-native";

export default function SkillsScreen() {
  const skills = [
    { name: "Handstand", level: "Beginner", progress: 30 },
    { name: "Front Lever", level: "Intermediate", progress: 15 },
    { name: "Planche", level: "Advanced", progress: 5 },
    { name: "Muscle Up", level: "Intermediate", progress: 45 },
    { name: "Human Flag", level: "Advanced", progress: 0 },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-2">
          Skill Progressions
        </Text>
        <Text className="text-text-secondary mb-8 text-lg">
          Master advanced calisthenics movements
        </Text>

        {skills.map((skill, index) => (
          <Pressable
            key={index}
            className="bg-surface p-6 rounded-xl mb-4 border border-border"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-primary text-xl font-bold">
                {skill.name}
              </Text>
              <Text className="text-text-secondary text-sm font-medium">
                {skill.level}
              </Text>
            </View>

            <View className="bg-surface-elevated h-3 rounded-full overflow-hidden">
              <View
                className="bg-primary h-full rounded-full"
                style={{ width: `${skill.progress}%` }}
              />
            </View>

            <Text className="text-text-secondary text-sm mt-2 font-medium">
              {skill.progress}% complete
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
