// app/(tabs)/(profile)/index.tsx - Updated with scrollable settings
import { View, Text, Pressable, Alert, TextInput } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import { signOut, linkWithCredential, EmailAuthProvider } from "firebase/auth";
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
    weeklyStreak: 0,
    longestWeeklyStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmailLink, setShowEmailLink] = useState(false);

  // Settings state
  const [editLevel, setEditLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [editDays, setEditDays] = useState(3);
  const [editGoalType, setEditGoalType] = useState<"skill" | "strength">("strength");
  const [editPrimaryGoalId, setEditPrimaryGoalId] = useState("");
  const [editAutoProgress, setEditAutoProgress] = useState(true);

  // Email linking
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      if (userData) {
        setEditLevel(userData.level);
        setEditDays(userData.trainingDaysPerWeek);
        setEditGoalType(userData.goalType);
        setEditPrimaryGoalId(userData.primaryGoalId);
        setEditAutoProgress(userData.autoProgressExercises);
      }

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

  const handleSaveSettings = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      await backend.updateUser(userId, {
        level: editLevel,
        trainingDaysPerWeek: editDays,
        goalType: editGoalType,
        primaryGoalId: editPrimaryGoalId,
        autoProgressExercises: editAutoProgress,
      });

      Alert.alert("Success", "Settings updated!");
      setShowSettings(false);
      loadUserData();
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const handleLinkEmail = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        Alert.alert("Error", "Not an anonymous account");
        return;
      }

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(currentUser, credential);

      Alert.alert("Success", "Email linked to your account!");
      setShowEmailLink(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error linking email:", error);
      Alert.alert("Error", error.message || "Failed to link email");
    }
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
        <Text className="text-text-secondary mt-4">Loading workouts...</Text>
      </View>
    );
  }

  // Email Link View
  if (showEmailLink && FIREBASE_AUTH.currentUser?.isAnonymous) {
    return (
      <View className="flex-1 bg-background px-6 pt-16">
        <Pressable onPress={() => setShowEmailLink(false)} className="mb-4 hover-scale">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#00d9ff" />
        </Pressable>

        <Text className="text-primary text-3xl font-bold mb-2">Link Email</Text>
        <Text className="text-text-secondary mb-6">
          Convert your anonymous account to a permanent account
        </Text>

        <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
          <Text className="text-text-secondary text-sm mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#7a86a8"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-surface-elevated text-text-primary px-4 py-3 rounded-xl mb-4"
          />

          <Text className="text-text-secondary text-sm mb-2">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            placeholderTextColor="#7a86a8"
            secureTextEntry
            className="bg-surface-elevated text-text-primary px-4 py-3 rounded-xl"
          />
        </View>

        <Pressable
          onPress={handleLinkEmail}
          className="bg-primary py-4 rounded-2xl hover-scale shadow-elevated"
        >
          <Text className="text-background text-center font-bold text-lg">
            Link Email
          </Text>
        </Pressable>
      </View>
    );
  }

  // Settings Edit View - NOW SCROLLABLE
  if (showSettings) {
    const settingsData = [
      { id: 'header', type: 'header' },
      { id: 'experience', type: 'experience' },
      { id: 'days', type: 'days' },
      { id: 'goal', type: 'goal' },
      { id: 'autoprogress', type: 'autoprogress' },
      { id: 'save', type: 'save' },
    ];

    const renderSettingsItem = ({ item }: { item: typeof settingsData[0] }) => {
      switch (item.type) {
        case 'header':
          return (
            <View className="flex-row items-center mb-4 gap-2">
              <Pressable onPress={() => setShowSettings(false)} className="hover-scale">
                <MaterialCommunityIcons name="arrow-left" size={24} color="#00d9ff" />
              </Pressable>
              <Text className="text-primary text-3xl font-bold">Settings</Text>
            </View>
          );

        case 'experience':
          return (
            <View className="mb-6">
              <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
                Experience Level
              </Text>
              <View className="flex-row gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setEditLevel(level)}
                    className={`flex-1 card-frosted py-4 rounded-2xl hover-scale border-2${editLevel === level ? " border-primary" : ""
                      }`}
                  >
                    <Text
                      className={`text-center font-bold capitalize ${editLevel === level ? "text-primary" : "text-text-secondary"
                        }`}
                    >
                      {level}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );

        case 'days':
          return (
            <View className="mb-6">
              <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
                Training Days Per Week
              </Text>
              <View className="card-frosted p-6 rounded-3xl shadow-elevated">
                <Text className="text-text-primary text-4xl font-bold text-center mb-4">
                  {editDays}
                </Text>
                <View className="flex-row items-center justify-center gap-4">
                  <Pressable
                    onPress={() => setEditDays(Math.max(1, editDays - 1))}
                    className="bg-surface-elevated w-12 h-12 rounded-2xl items-center justify-center hover-scale"
                  >
                    <MaterialCommunityIcons name="minus" size={24} color="#00d9ff" />
                  </Pressable>
                  <Pressable
                    onPress={() => setEditDays(Math.min(7, editDays + 1))}
                    className="bg-surface-elevated w-12 h-12 rounded-2xl items-center justify-center hover-scale"
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#00d9ff" />
                  </Pressable>
                </View>
              </View>
            </View>
          );

        case 'goal':
          return (
            <View className="mb-6">
              <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
                Goal Type
              </Text>
              <View className="flex-row bg-surface-elevated p-1 rounded-2xl">
                <Pressable
                  onPress={() => setEditGoalType("strength")}
                  className={`flex-1 py-3 rounded-xl ${editGoalType === "strength" ? "bg-primary" : ""
                    }`}
                >
                  <Text
                    className={`text-center font-bold ${editGoalType === "strength" ? "text-background" : "text-text-secondary"
                      }`}
                  >
                    Strength
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setEditGoalType("skill")}
                  className={`flex-1 py-3 rounded-xl ${editGoalType === "skill" ? "bg-primary" : ""
                    }`}
                >
                  <Text
                    className={`text-center font-bold ${editGoalType === "skill" ? "text-background" : "text-text-secondary"
                      }`}
                  >
                    Skills
                  </Text>
                </Pressable>
              </View>
            </View>
          );

        case 'autoprogress':
          return (
            <View className="mb-6">
              <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
                Automatic Progression
              </Text>
              <Pressable
                onPress={() => setEditAutoProgress(!editAutoProgress)}
                className="card-frosted p-5 rounded-3xl shadow-elevated hover-scale"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-text-primary text-lg font-bold mb-1">
                      Auto-Progress Exercises
                    </Text>
                    <Text className="text-text-secondary text-sm leading-5">
                      Automatically replace completed exercises with the next progression in your workout plans
                    </Text>
                  </View>
                  <View
                    className={`w-14 h-8 rounded-full p-1 ${editAutoProgress ? "bg-primary" : "bg-surface-elevated"
                      }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full bg-background shadow-elevated ${editAutoProgress ? "ml-auto" : ""
                        }`}
                    />
                  </View>
                </View>
              </Pressable>
            </View>
          );

        case 'save':
          return (
            <Pressable
              onPress={handleSaveSettings}
              className="bg-primary py-4 rounded-2xl hover-scale shadow-elevated mb-6"
            >
              <Text className="text-background text-center font-bold text-lg">
                Save Changes
              </Text>
            </Pressable>
          );

        default:
          return null;
      }
    };

    return (
      <View className="flex-1 bg-background">
        <FlashList
          data={settingsData}
          renderItem={renderSettingsItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64 }}
          showsVerticalScrollIndicator={false}
        />
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
                    {formatDate(workout.completedAt)}
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

  // Main Profile View
  return (
    <FlashList
      className="flex-1 bg-background"
      data={[0]}
      renderItem={() => (
        <>
          <View className="px-6 pt-16">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-primary text-4xl font-bold">Profile</Text>
              <Pressable
                onPress={() => setShowSettings(true)}
                className="bg-primary/10 p-3 rounded-2xl hover-scale"
              >
                <MaterialCommunityIcons name="cog" size={24} color="#00d9ff" />
              </Pressable>
            </View>

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
                    {historyStats.weeklyStreak}
                  </Text>
                  <Text className="text-text-secondary text-xs text-center">
                    Week Streak
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
                    {historyStats.longestWeeklyStreak}
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

            {/* Link Email (if anonymous) */}
            {FIREBASE_AUTH.currentUser?.isAnonymous && (
              <Pressable
                onPress={() => setShowEmailLink(true)}
                className="card-frosted p-5 rounded-3xl mb-4 shadow-elevated hover-scale"
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="email-plus" size={24} color="#00d9ff" />
                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-bold text-base mb-1">
                      Link Email Account
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Secure your account with email login
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                </View>
              </Pressable>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

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
              className="bg-primary py-4 rounded-2xl mb-4 hover-scale shadow-elevated"
            >
              <Text className="text-background text-center font-bold text-base">
                Restore Purchases
              </Text>
            </Pressable>
          </View>
        </>
      )}
    />
  );
}