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
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16">
        <Text className="text-white text-3xl font-bold mb-2">
          Skill Progressions
        </Text>
        <Text className="text-slate-400 mb-8">
          Master advanced calisthenics movements
        </Text>

        {skills.map((skill, index) => (
          <Pressable key={index} className="bg-slate-800 p-6 rounded-lg mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-xl font-semibold">
                {skill.name}
              </Text>
              <Text className="text-slate-400 text-sm">{skill.level}</Text>
            </View>

            <View className="bg-slate-700 h-2 rounded-full overflow-hidden">
              <View
                className="bg-blue-600 h-full"
                style={{ width: `${skill.progress}%` }}
              />
            </View>

            <Text className="text-slate-400 text-sm mt-2">
              {skill.progress}% complete
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
