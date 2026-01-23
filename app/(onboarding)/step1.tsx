import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../utils/theme";
import { AnimatedPressable } from "../../components/AnimatedPressable";

export default function Step1Screen() {
  const router = useRouter();
  const primaryColor = useThemeColor('primary');

  return (
    <View className="flex-1 bg-background">
      {/* Animated Background */}
      <View className="absolute inset-0 opacity-20">
        <View className="absolute top-20 right-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <View className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </View>

      <View className="flex-1 justify-center items-center px-8">
        {/* Hero Icon */}
        <View className="mb-12 items-center">


          <Text className="text-primary text-5xl font-bold mb-4 text-center">
            Welcome to
          </Text>
          <Text className="text-primary text-6xl font-bold mb-6 text-center">
            Ascend
          </Text>

          <Text className="text-text-primary text-2xl text-center mb-4 font-semibold">
            Transform Your Body
          </Text>
          <Text className="text-text-secondary text-center text-lg leading-7 max-w-sm">
            Master calisthenics skills and build incredible strength using just
            your bodyweight
          </Text>
        </View>

        {/* Feature Pills */}
        <View className="flex-row flex-wrap justify-center gap-2 mb-8">
          <View className="bg-primary/10 border border-primary/30 px-4 py-2 rounded-full">
            <Text className="text-primary text-sm font-semibold">🔥 AI-Powered</Text>
          </View>
          <View className="bg-primary/10 border border-primary/30 px-4 py-2 rounded-full">
            <Text className="text-primary text-sm font-semibold">💪 Progressive</Text>
          </View>
          <View className="bg-primary/10 border border-primary/30 px-4 py-2 rounded-full">
            <Text className="text-primary text-sm font-semibold">📈 Track Progress</Text>
          </View>
        </View>
      </View>

      <View className="px-8 mb-12">
        <AnimatedPressable
          onPress={() => router.push("/(onboarding)/step2")}
          className="bg-primary py-4 rounded-2xl shadow-elevated-lg"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-background text-center font-bold text-xl">
              Let's Get Started
            </Text>
          </View>
        </AnimatedPressable>

        {/* Progress Dots */}
        <View className="flex-row justify-center mt-8 gap-2">
          <View className="w-10 h-2 bg-primary rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
          <View className="w-2 h-2 bg-surface-elevated rounded-full" />
        </View>
      </View>
    </View>
  );
}