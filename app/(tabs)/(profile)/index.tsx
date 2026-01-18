import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../config/firebase";
import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import * as backend from "../../../backend";
import { User } from "../../../types/User";

export default function ProfileScreen() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    recentActivityCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      // Load subscription status
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      // Load user profile
      const userData = await backend.getUser(userId);
      setUser(userData);

      // Load progress stats
      const progressStats = await backend.getUserProgressStats(userId);
      setStats({
        totalCompleted: progressStats.totalExercisesCompleted,
        recentActivityCount: progressStats.recentActivity.length,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(FIREBASE_AUTH);
            router.replace("/(onboarding)/step1");
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "This will delete all your workout plans and start fresh. Your progress history will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = FIREBASE_AUTH.currentUser?.uid;
              if (userId) {
                await backend.deleteAllUserPlans(userId);
                Alert.alert("Success", "Workout plans have been reset");
                loadUserData();
              }
            } catch (error) {
              console.error("Error resetting progress:", error);
              Alert.alert("Error", "Failed to reset progress");
            }
          },
        },
      ]
    );
  };

  const hasProAccess = customerInfo?.entitlements.active["pro"] !== undefined;
  const expirationDate =
    customerInfo?.entitlements.active["pro"]?.expirationDate;

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#38e8ff" />
      </View>
    );
  }

  return (
    <FlashList
      className="flex-1 bg-background"
      data={[0]}
      renderItem={() => (
        <>
          <View className="px-6 pt-16">
            <Text className="text-primary text-4xl font-bold mb-8">
              Profile
            </Text>

            {/* User Stats */}
            {user && (
              <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
                <Text className="text-text-secondary mb-4 font-medium text-sm uppercase">
                  Training Profile
                </Text>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-text-secondary">Current Goal</Text>
                  <Text className="text-text-primary font-semibold capitalize">
                    {user.goalType === "skill"
                      ? "Skill Training"
                      : "Strength Building"}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-text-secondary">Experience Level</Text>
                  <Text className="text-text-primary font-semibold capitalize">
                    {user.level}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-text-secondary">Training Days</Text>
                  <Text className="text-text-primary font-semibold">
                    {user.trainingDaysPerWeek} days/week
                  </Text>
                </View>
              </View>
            )}

            {/* Progress Stats */}
            <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
              <Text className="text-text-secondary mb-4 font-medium text-sm uppercase">
                Your Progress
              </Text>

              <View className="flex-row justify-between mb-3">
                <Text className="text-text-secondary">Exercises Completed</Text>
                <Text className="text-primary text-2xl font-bold">
                  {stats.totalCompleted}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-text-secondary">Recent Activity</Text>
                <Text className="text-text-primary font-semibold">
                  {stats.recentActivityCount} workouts
                </Text>
              </View>
            </View>

            {/* User ID */}
            <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
              <Text className="text-text-secondary mb-2 font-medium">
                User ID
              </Text>
              <Text className="text-text-primary text-sm font-mono">
                {FIREBASE_AUTH.currentUser?.uid.substring(0, 20)}...
              </Text>
              <Text className="text-text-muted text-xs mt-2">
                {FIREBASE_AUTH.currentUser?.isAnonymous
                  ? "Anonymous Account"
                  : "Registered Account"}
              </Text>
            </View>

            {/* Subscription Status */}
            <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
              <Text className="text-text-secondary mb-2 font-medium">
                Subscription Status
              </Text>
              <Text
                className={`text-xl font-bold ${
                  hasProAccess ? "text-success" : "text-error"
                }`}
              >
                {hasProAccess ? "Pro Active ✓" : "No Active Subscription"}
              </Text>
              {expirationDate && (
                <Text className="text-text-secondary mt-2 text-sm">
                  {customerInfo?.entitlements.active["pro"]?.willRenew
                    ? `Renews: ${new Date(expirationDate).toLocaleDateString()}`
                    : `Expires: ${new Date(
                        expirationDate
                      ).toLocaleDateString()}`}
                </Text>
              )}
            </View>

            {/* Actions */}
            <Pressable
              onPress={async () => {
                try {
                  const info = await Purchases.restorePurchases();
                  setCustomerInfo(info);
                  Alert.alert("Success", "Purchases restored successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to restore purchases");
                }
              }}
              className="bg-primary py-4 rounded-xl mb-4"
            >
              <Text className="text-background text-center font-bold text-base">
                Restore Purchases
              </Text>
            </Pressable>

            <Pressable
              onPress={handleResetProgress}
              className="border-2 border-warning py-4 rounded-xl mb-4"
            >
              <Text className="text-warning text-center font-bold text-base">
                Reset Workout Plans
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSignOut}
              className="border-2 border-error py-4 rounded-xl mb-4"
            >
              <Text className="text-error text-center font-bold text-base">
                Sign Out
              </Text>
            </Pressable>

            <Text className="text-text-muted text-xs text-center mt-4 mb-8">
              Signing out will clear your session. Your progress is saved.
            </Text>
          </View>
        </>
      )}
    />
  );
}
