import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../config/firebase";
import { useCallback, useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import * as backend from "../../../backend";
import { User } from "../../../types/User";
import { WorkoutHistory } from "../../../types/WorkoutHistory";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeSwitcher } from "../../../components/ThemeSwitcher";

export default function ProfileScreen() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    recentActivityCount: 0,
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
  const [historyStats, setHistoryStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      const userData = await backend.getUser(userId);
      setUser(userData);

      const progressStats = await backend.getUserProgressStats(userId);
      setStats({
        totalCompleted: progressStats.totalExercisesCompleted,
        recentActivityCount: progressStats.recentActivity.length,
      });

      const history = await backend.getRecentWorkoutHistory(userId, 10);
      setWorkoutHistory(history);

      const workoutStats = await backend.getWorkoutHistoryStats(userId);
      setHistoryStats(workoutStats);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "This will delete all your workout plans and start fresh. Your workout history will be kept.",
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getDayName = (dayIndex: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayIndex] || `Day ${dayIndex}`;
  };

  const hasProAccess = customerInfo?.entitlements.active["pro"] !== undefined;
  const expirationDate = customerInfo?.entitlements.active["pro"]?.expirationDate;

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
      </View>
    );
  }

  // Workout History Detail View
  if (showHistory) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => setShowHistory(false)} className="mb-4 hover-scale">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#00d9ff" />
          </Pressable>
          <Text className="text-primary text-3xl font-bold mb-2">
            Workout History
          </Text>
          <Text className="text-text-secondary mb-4">
            {historyStats.totalWorkouts} workouts completed
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={workoutHistory}
          renderItem={({ item: workout }) => (
            <View className="card-frosted p-5 rounded-3xl mb-3 shadow-elevated">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-text-primary text-lg font-bold mb-1">
                    {getDayName(workout.dayIndex)} Workout
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {formatDate(workout.completedAt)} • {formatDuration(workout.duration)}
                  </Text>
                </View>
                <View className="bg-success/20 px-3 py-1 rounded-full">
                  <Text className="text-success text-xs font-bold">COMPLETED</Text>
                </View>
              </View>

              <View className="bg-surface-elevated p-3 rounded-lg">
                <Text className="text-text-secondary text-xs mb-2 uppercase font-semibold">
                  Exercises ({workout.exercises.length})
                </Text>
                {workout.exercises.map((ex, idx) => (
                  <View key={idx} className="mb-2">
                    <Text className="text-text-primary font-semibold text-sm">
                      {ex.completedSets}/{ex.sets} sets completed
                    </Text>
                    {ex.actualValues.length > 0 && (
                      <Text className="text-text-secondary text-xs">
                        Best: {Math.max(...ex.actualValues)} {ex.target.type === "reps" ? "reps" : "sec"}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="card-frosted p-8 rounded-3xl items-center shadow-elevated">
              <Text className="text-text-secondary text-center">
                No workout history yet. Complete your first workout to see it here!
              </Text>
            </View>
          }
        />
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

            {/* Workout Stats */}
            <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
              <Text className="text-text-secondary mb-4 font-medium text-sm uppercase">
                Workout Stats
              </Text>

              <View className="flex-row justify-between mb-4">
                <View className="flex-1 items-center bg-surface-elevated p-4 rounded-lg mr-2">
                  <Text className="text-primary text-3xl font-bold mb-1">
                    {historyStats.totalWorkouts}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
                    Total Workouts
                  </Text>
                </View>
                <View className="flex-1 items-center bg-surface-elevated p-4 rounded-lg ml-2">
                  <Text className="text-primary text-3xl font-bold mb-1">
                    {historyStats.currentStreak}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
                    Day Streak
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 items-center bg-surface-elevated p-4 rounded-lg mr-2">
                  <Text className="text-primary text-3xl font-bold mb-1">
                    {stats.totalCompleted}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
                    Exercises Done
                  </Text>
                </View>
                <View className="flex-1 items-center bg-surface-elevated p-4 rounded-lg ml-2">
                  <Text className="text-primary text-3xl font-bold mb-1">
                    {historyStats.longestStreak}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
                    Best Streak
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setShowHistory(true)}
                className="mt-4 bg-primary/10 border border-primary py-3 rounded-xl hover-scale"
              >
                <Text className="text-primary text-center font-bold">
                  View Full History →
                </Text>
              </Pressable>
            </View>

            {/* Recent Workouts Preview */}
            {workoutHistory.length > 0 && (
              <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
                <Text className="text-text-secondary mb-3 font-medium text-sm uppercase">
                  Recent Workouts
                </Text>
                {workoutHistory.slice(0, 3).map((workout) => (
                  <View
                    key={workout.id}
                    className="flex-row justify-between items-center mb-3 pb-3 border-b border-border/30"
                  >
                    <View className="flex-1">
                      <Text className="text-text-primary font-semibold">
                        {getDayName(workout.dayIndex)} Workout
                      </Text>
                      <Text className="text-text-secondary text-xs">
                        {formatDate(workout.completedAt)} • {workout.exercises.length} exercises
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#22c55e"
                    />
                  </View>
                ))}
              </View>
            )}
            {/* User Stats */}
            {user && (
              <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
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

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* User ID */}
            <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
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
            <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
              <Text className="text-text-secondary mb-2 font-medium">
                Subscription Status
              </Text>
              <Text
                className={`text-xl font-bold ${hasProAccess ? "text-success" : "text-error"
                  }`}
              >
                {hasProAccess ? "Pro Active" : "No Active Subscription"}
              </Text>
              {expirationDate && (
                <Text className="text-text-secondary mt-2 text-sm">
                  {customerInfo?.entitlements.active["pro"]?.willRenew
                    ? `Renews: ${new Date(expirationDate).toLocaleDateString()}`
                    : `Expires: ${new Date(expirationDate).toLocaleDateString()}`}
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
              className="bg-primary py-4 rounded-2xl mb-4 hover-scale"
            >
              <Text className="text-background text-center font-bold text-base">
                Restore Purchases
              </Text>
            </Pressable>

            <Pressable
              onPress={handleResetProgress}
              className="border-2 border-warning py-4 rounded-2xl mb-4 hover-scale"
            >
              <Text className="text-warning text-center font-bold text-base">
                Reset Workout Plans
              </Text>
            </Pressable>
          </View>
        </>
      )}
    />
  );
}