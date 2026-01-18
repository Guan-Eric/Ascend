import { View, Text, Pressable, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Exercise } from "../../../types/Exercise";
import { Plan } from "../../../types/Plan";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StrengthExerciseDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [nextExercise, setNextExercise] = useState<Exercise | null>(null);
  const [previousExercises, setPreviousExercises] = useState<Exercise[]>([]);
  const [canAccess, setCanAccess] = useState(false);
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  useEffect(() => {
    loadExerciseDetails();
    loadUserPlans();
  }, []);

  const loadExerciseDetails = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const ex = await backend.getExercise(exerciseId);
      if (!ex) return;
      setExercise(ex);

      // Check if user can access this exercise
      const completedIds = await backend.getCompletedExerciseIds(userId);
      const access = await backend.canAccessExercise(exerciseId, completedIds);
      setCanAccess(access);

      // Get next progression
      if (ex.nextProgressionId) {
        const next = await backend.getExercise(ex.nextProgressionId);
        setNextExercise(next);
      }

      // Get previous exercises (prerequisites)
      if (ex.prerequisites) {
        const prevExercises = await backend.getExercisesByIds(ex.prerequisites);
        setPreviousExercises(prevExercises);
      }
    } catch (error) {
      console.error("Error loading exercise details:", error);
    }
  };

  const loadUserPlans = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const plans = await backend.getUserPlans(userId);
      setUserPlans(plans);
    } catch (error) {
      console.error("Error loading user plans:", error);
    }
  };

  const addToNewPlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId || !exercise) return;

      await backend.createPlan({
        userId,
        goalId: "custom",
        dayIndex: 1,
        exercises: [
          {
            exerciseId: exercise.id,
            sets: 3,
            target: exercise.target,
          },
        ],
        completed: false,
        createdAt: Date.now(),
      });

      Alert.alert("Success", "New workout plan created with this exercise!");
      router.back();
    } catch (error) {
      console.error("Error creating plan:", error);
      Alert.alert("Error", "Failed to create plan");
    }
  };

  const addToExistingPlan = async (planId: string) => {
    try {
      if (!exercise) return;

      const plan = await backend.getPlan(planId);
      if (!plan) return;

      // Check if exercise already in plan
      const alreadyExists = plan.exercises.some(
        (ex) => ex.exerciseId === exercise.id
      );

      if (alreadyExists) {
        Alert.alert("Already Added", "This exercise is already in the plan");
        return;
      }

      // Add exercise to plan
      const updatedExercises = [
        ...plan.exercises,
        {
          exerciseId: exercise.id,
          sets: 3,
          target: exercise.target,
        },
      ];

      await backend.updatePlan(planId, {
        exercises: updatedExercises,
      });

      Alert.alert("Success", "Exercise added to workout plan!");
      setShowPlanPicker(false);
    } catch (error) {
      console.error("Error adding to plan:", error);
      Alert.alert("Error", "Failed to add exercise");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "push":
        return "arm-flex";
      case "pull":
        return "weight-lifter";
      case "legs":
        return "human-handsdown";
      case "core":
        return "stomach";
      case "skill":
        return "medal-outline";
      default:
        return "dumbbell";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-success";
      case "intermediate":
        return "text-warning";
      case "advanced":
        return "text-error";
      default:
        return "text-primary";
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayIndex] || `Day ${dayIndex}`;
  };

  if (!exercise) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary">Loading...</Text>
      </View>
    );
  }

  // Plan Picker Modal View
  if (showPlanPicker) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => setShowPlanPicker(false)} className="mb-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-2xl font-bold mb-2">
            Add to Existing Plan
          </Text>
          <Text className="text-text-secondary mb-4">
            Choose a workout plan to add this exercise to
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={userPlans}
          renderItem={({ item: plan }) => (
            <Pressable
              onPress={() => addToExistingPlan(plan.id)}
              className="bg-surface p-4 rounded-xl mb-3 border border-border flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-lg mb-1">
                  {getDayName(plan.dayIndex)} Workout
                </Text>
                <Text className="text-text-secondary text-sm">
                  {plan.exercises.length} exercises • {plan.completed ? "Completed" : "Not completed"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={28}
                color="#38e8ff"
              />
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="bg-surface p-6 rounded-xl border border-border">
              <Text className="text-text-secondary text-center">
                No workout plans found. Create a new plan instead.
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        className="flex-1"
        data={[0]}
        renderItem={() => (
          <>
            {/* Header */}
            <View className="px-6 pt-16 pb-6">
              <Pressable onPress={() => router.back()} className="mb-4">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#38e8ff"
                />
              </Pressable>

              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons
                  name={getCategoryIcon(exercise.category)}
                  size={40}
                  color="#38e8ff"
                />
                <Text
                  className={`${getLevelColor(
                    exercise.level
                  )} text-sm font-bold uppercase ml-auto`}
                >
                  {exercise.level}
                </Text>
              </View>

              <Text className="text-text-primary text-4xl font-bold mb-3">
                {exercise.name}
              </Text>

              <View className="flex-row items-center">
                <View className="bg-surface px-4 py-2 rounded-lg mr-3">
                  <Text className="text-text-secondary text-xs uppercase">
                    Category
                  </Text>
                  <Text className="text-text-primary font-bold capitalize">
                    {exercise.category}
                  </Text>
                </View>
                <View className="bg-surface px-4 py-2 rounded-lg mr-3">
                  <Text className="text-text-secondary text-xs uppercase">
                    Equipment
                  </Text>
                  <Text className="text-text-primary font-bold capitalize">
                    {exercise.equipment}
                  </Text>
                </View>
                <View className="bg-surface px-4 py-2 rounded-lg">
                  <Text className="text-text-secondary text-xs uppercase">
                    Target
                  </Text>
                  <Text className="text-text-primary font-bold">
                    {exercise.target.value}{" "}
                    {exercise.target.type === "reps" ? "reps" : "sec"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="px-6">
              {/* Access Status */}
              {!canAccess && (
                <View className="bg-warning/20 border-2 border-warning p-4 rounded-xl mb-4">
                  <Text className="text-warning font-bold mb-1">
                    🔒 Locked Exercise
                  </Text>
                  <Text className="text-text-secondary">
                    Complete the prerequisites below to unlock this exercise
                  </Text>
                </View>
              )}

              {/* Description */}
              <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
                <Text className="text-primary text-lg font-bold mb-3">
                  How to Perform
                </Text>
                <Text className="text-text-primary leading-6">
                  {exercise.description}
                </Text>
              </View>

              {/* Prerequisites */}
              {previousExercises.length > 0 && (
                <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
                  <Text className="text-primary text-lg font-bold mb-3">
                    Prerequisites
                  </Text>
                  {previousExercises.map((prevEx) => (
                    <Pressable
                      key={prevEx.id}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/(strength)/exercise-details",
                          params: { exerciseId: prevEx.id },
                        })
                      }
                      className="flex-row items-center justify-between p-3 bg-surface-elevated rounded-lg mb-2"
                    >
                      <Text className="text-text-primary font-semibold flex-1">
                        {prevEx.name}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="#7a86a8"
                      />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Next Progression */}
              {nextExercise && (
                <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
                  <Text className="text-primary text-lg font-bold mb-3">
                    Next Progression
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(strength)/exercise-details",
                        params: { exerciseId: nextExercise.id },
                      })
                    }
                    className="flex-row items-center justify-between p-3 bg-surface-elevated rounded-lg"
                  >
                    <View className="flex-1">
                      <Text className="text-text-primary font-semibold">
                        {nextExercise.name}
                      </Text>
                      <Text className="text-text-secondary text-sm">
                        {nextExercise.target.value}{" "}
                        {nextExercise.target.type === "reps" ? "reps" : "sec"}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#7a86a8"
                    />
                  </Pressable>
                </View>
              )}
            </View>
          </>
        )}
      />

      {/* Action Buttons */}
      <View className="px-6 pb-8 bg-background">
        <Pressable
          onPress={addToNewPlan}
          className="bg-primary py-4 rounded-xl mb-3"
        >
          <Text className="text-background text-center font-bold text-lg">
            + Create New Plan
          </Text>
        </Pressable>
        
        {userPlans.length > 0 && (
          <Pressable
            onPress={() => setShowPlanPicker(true)}
            className="border-2 border-primary py-4 rounded-xl"
          >
            <Text className="text-primary text-center font-bold text-lg">
              Add to Existing Plan
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}