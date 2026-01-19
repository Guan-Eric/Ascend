import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planExercises, setPlanExercises] = useState<Record<string, Exercise[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const userPlans = await backend.getUserPlans(userId);
      setPlans(userPlans);

      const exercisesMap: Record<string, Exercise[]> = {};
      
      for (const plan of userPlans) {
        const exercisePromises = plan.exercises.map((ex) =>
          backend.getExercise(ex.exerciseId)
        );
        const loadedExercises = await Promise.all(exercisePromises);
        exercisesMap[plan.id] = loadedExercises.filter((ex) => ex !== null) as Exercise[];
      }

      setPlanExercises(exercisesMap);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayIndex] || `Day ${dayIndex}`;
  };

  const getDayEmoji = (dayIndex: number) => {
    const emojis = ["☀️", "💪", "🔥", "⚡", "🚀", "💯", "🎯"];
    return emojis[dayIndex] || "💪";
  };

  const handleQuickComplete = async (planId: string) => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      const plan = plans.find(p => p.id === planId);
      
      if (!userId || !plan) return;

      await backend.saveWorkoutHistory({
        userId,
        planId: plan.id,
        dayIndex: plan.dayIndex,
        exercises: plan.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          completedSets: ex.sets,
          target: ex.target,
          actualValues: Array(ex.sets).fill(ex.target.value),
        })),
        completedAt: Date.now(),
      });

      for (const planExercise of plan.exercises) {
        await backend.markExerciseCompleted(
          userId,
          planExercise.exerciseId,
          planExercise.target.value
        );
      }

      Alert.alert("Workout Complete!", "Great job! Your workout has been logged.");
      
    } catch (error) {
      console.error("Error completing plan:", error);
      Alert.alert("Error", "Failed to log workout");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="shimmer w-16 h-16 rounded-full bg-surface mb-4" />
        <Text className="text-text-secondary mt-4">Loading workouts...</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <FlashList
          className="flex-1 px-6 pt-16"
          data={[0]}
          renderItem={() => (
            <>
              <Text className="text-primary text-5xl font-bold mb-3">
                My Workouts
              </Text>
              <Text className="text-text-secondary mb-8 text-lg">
                Create your personalized training schedule
              </Text>

              <View className="card-frosted p-8 rounded-3xl items-center justify-center mb-4">
                <Text className="text-text-primary text-2xl font-bold mb-3 text-center">
                  Start Your Journey
                </Text>
                <Text className="text-text-secondary text-center mb-8 leading-6">
                  Create your first workout plan and begin your transformation
                </Text>
                <Pressable
                  onPress={() => router.push("/(tabs)/(home)/create-plan")}
                  className="bg-primary px-8 py-5 rounded-2xl flex-row items-center shadow-elevated-lg hover-scale"
                >
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="#000000"
                  />
                  <Text className="text-background font-bold text-lg ml-2">
                    Create Workout Plan
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-primary text-4xl font-bold">
              My Workouts
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-success mr-2" />
              <Text className="text-text-secondary text-sm">
                {plans.length} active {plans.length === 1 ? 'plan' : 'plans'}
              </Text>
            </View>
          </View>
          <Pressable 
            onPress={() => router.push("/(tabs)/(home)/create-plan")}
            className="bg-primary/10 p-4 rounded-2xl border border-primary/30 hover-scale"
          >
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color="#00d9ff"
            />
          </Pressable>
        </View>
      </View>

      <FlashList
        className="flex-1 px-6"
        data={plans}
        renderItem={({ item: plan }) => {
          const exercises = planExercises[plan.id] || [];
          
          return (
            <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
              {/* Plan Header */}
              <View className="flex-row items-center mb-4">
                
                <View className="flex-1">
                  <Text className="text-text-primary text-2xl font-bold mb-1">
                    {getDayName(plan.dayIndex)}
                  </Text>
                  <View className="flex-row items-center">
                    
                    <Text className="text-text-secondary text-sm">
                      {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/edit-plan",
                      params: { planId: plan.id },
                    })
                  }
                  className="bg-surface-elevated p-3 rounded-xl hover-scale"
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color="#00d9ff"
                  />
                </Pressable>
              </View>

              {/* Exercise Preview with Glass Effect */}
              <View className="glass p-5 rounded-2xl mb-4">
                {exercises.slice(0, 3).map((exercise, index) => {
                  const planExercise = plan.exercises[index];
                  return (
                    <View 
                      key={exercise.id} 
                      className={`flex-row items-center mb-3 ${
                        index < Math.min(exercises.length, 3) - 1 ? 'pb-3 border-b border-border/30' : ''
                      }`}
                    >
                      <View className="bg-primary/10 w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <Text className="text-primary font-bold">{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-text-primary font-semibold mb-1">
                          {exercise.name}
                        </Text>
                        <Text className="text-text-secondary text-xs">
                          {planExercise?.sets} sets × {planExercise?.target.value}{" "}
                          {planExercise?.target.type === "reps" ? "reps" : "sec"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                {exercises.length > 3 && (
                  <View className="bg-surface-elevated/50 px-3 py-2 rounded-lg mt-1">
                    <Text className="text-text-muted text-xs text-center">
                      +{exercises.length - 3} more exercises
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              <View className="">
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/workout",
                      params: { planId: plan.id },
                    })
                  }
                  className="flex-1 bg-primary py-4 rounded-2xl shadow-elevated hover-scale"
                >
                  <View className="flex-row items-center justify-center">
                    <MaterialCommunityIcons name="play" size={20} color="#000000" />
                    <Text className="text-background text-center font-bold text-base ml-2">
                      Start
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}