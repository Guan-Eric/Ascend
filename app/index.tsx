// app/index.tsx - Entry point that checks auth state
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../config/firebase";
import Purchases from "react-native-purchases";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getUser } from "../backend";
import { paywallHref, resolveAppAccess } from "../utils/access";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      if (user) {
        await Purchases.logIn(user.uid);

        const userData = await getUser(user.uid);

        if (!userData) {
          router.replace("/(onboarding)/step1");
          return;
        }

        const access = await resolveAppAccess(userData);

        if (access.kind === "pro" || access.kind === "sample") {
          router.replace("/(tabs)/(home)");
          return;
        }

        router.replace(
          paywallHref({
            source:
              access.reason === "sample_completed"
                ? "sample_workout"
                : "returning",
            level: userData.level,
            trainingDays: userData.trainingDaysPerWeek,
            goalType: userData.goalType,
            primaryGoalId: userData.primaryGoalId,
          })
        );
      } else {
        router.replace("/(onboarding)/signin");
      }
    });

    return () => unsubscribe();
  };

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <LoadingSpinner size={64} />
      <Text className="text-primary text-2xl font-bold mt-4">Loading...</Text>
    </View>
  );
}
