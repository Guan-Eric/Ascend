import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Plan } from "../../../types/Plan";
import { Exercise } from "../../../types/Exercise";
import { Skill } from "../../../types/Skill";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PlanExercise = {
  exerciseId: string;
  sets: number;
  target: {
    type: "reps" | "time";
    value: number;
  };
};

export default function EditPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>(
    []
  );
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exerciseDetails, setExerciseDetails] = useState<Exercise[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanAndData();
  }, []);

  const loadPlanAndData = async () => {
    try {
      // Load the plan
      const loadedPlan = await backend.getPlan(planId);
      if (!loadedPlan) {
        Alert.alert("Error", "Plan not found");
        router.back();
        return;
      }

      setPlan(loadedPlan);
      setSelectedExercises(loadedPlan.exercises);

      // Load all available exercises and skills
      const exercises = await backend.getAllExercises();
      const skills = await backend.getAllSkills();
      setAllExercises(exercises);
      setAllSkills(skills);

      // Load exercise details for current plan
      const exercisePromises = loadedPlan.exercises.map((ex) =>
        backend.getExercise(ex.exerciseId)
      );
      const loadedDetails = await Promise.all(exercisePromises);
      setExerciseDetails(
        loadedDetails.filter((ex) => ex !== null) as Exercise[]
      );
    } catch (error) {
      console.error("Error loading plan:", error);
      Alert.alert("Error", "Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exercise: Exercise) => {
    const newExercise: PlanExercise = {
      exerciseId: exercise.id,
      sets: 3,
      target: exercise.target,
    };
    const updated = [...selectedExercises, newExercise];
    setSelectedExercises(updated);

    // Update exercise details
    const newDetails = await backend.getExercise(exercise.id);
    if (newDetails) {
      setExerciseDetails([...exerciseDetails, newDetails]);
    }

    setShowExercisePicker(false);
  };

  const addSkillProgression = async (skill: Skill) => {
    try {
      const skillData = await backend.getSkillWithExercises(skill.id);
      if (skillData) {
        const newExercises: PlanExercise[] = skillData.exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: 3,
          target: ex.target,
        }));
        setSelectedExercises([...selectedExercises, ...newExercises]);

        // Update exercise details
        setExerciseDetails([...exerciseDetails, ...skillData.exercises]);
      }
      setShowExercisePicker(false);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const removeExercise = (index: number) => {
    const updatedExercises = selectedExercises.filter((_, i) => i !== index);
    const updatedDetails = exerciseDetails.filter((_, i) => i !== index);
    setSelectedExercises(updatedExercises);
    setExerciseDetails(updatedDetails);
  };

  const updateSets = (index: number, sets: number) => {
    const updated = [...selectedExercises];
    updated[index].sets = Math.max(1, sets);
    setSelectedExercises(updated);
  };

  const updateTarget = (index: number, value: number) => {
    const updated = [...selectedExercises];
    updated[index].target.value = Math.max(1, value);
    setSelectedExercises(updated);
  };

  const savePlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId || !plan) return;

      if (selectedExercises.length === 0) {
        Alert.alert("Error", "Please add at least one exercise");
        return;
      }

      // Update the plan
      await backend.updatePlan(plan.id, {
        exercises: selectedExercises,
      });

      Alert.alert("Success", "Plan updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving plan:", error);
      Alert.alert("Error", "Failed to save plan");
    }
  };

  const deletePlan = () => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this workout plan?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!plan) return;
              await backend.deletePlan(plan.id);
              Alert.alert("Success", "Plan deleted");
              router.back();
            } catch (error) {
              console.error("Error deleting plan:", error);
              Alert.alert("Error", "Failed to delete plan");
            }
          },
        },
      ]
    );
  };

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = allSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary">Loading plan...</Text>
      </View>
    );
  }

  if (showExercisePicker) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => setShowExercisePicker(false)}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#38e8ff"
              />
            </Pressable>
            <Text className="text-primary text-2xl font-bold ml-4">
              Add Exercise or Skill
            </Text>
          </View>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises or skills..."
            placeholderTextColor="#7a86a8"
            className="bg-surface text-text-primary px-4 py-3 rounded-xl mb-4"
          />
        </View>

        <FlashList
          data={[0]}
          renderItem={() => (
            <>
              <Text className="text-text-secondary font-semibold mb-3 uppercase text-sm">
                Skills
              </Text>
              {filteredSkills.map((skill) => (
                <Pressable
                  key={skill.id}
                  onPress={() => addSkillProgression(skill)}
                  className="bg-surface p-4 rounded-xl mb-3 border border-border"
                >
                  <Text className="text-text-primary text-lg font-bold mb-1">
                    {skill.name}
                  </Text>
                  <Text className="text-text-secondary text-sm mb-2">
                    {skill.description}
                  </Text>
                  <Text className="text-primary text-xs">
                    +{skill.progression.length} exercises
                  </Text>
                </Pressable>
              ))}

              <Text className="text-text-secondary font-semibold mb-3 mt-6 uppercase text-sm">
                Individual Exercises
              </Text>
              {filteredExercises.map((exercise) => (
                <Pressable
                  key={exercise.id}
                  onPress={() => addExercise(exercise)}
                  className="bg-surface p-4 rounded-xl mb-3 border border-border"
                >
                  <Text className="text-text-primary text-lg font-bold mb-1">
                    {exercise.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {exercise.target.type === "reps"
                      ? `${exercise.target.value} reps`
                      : `${exercise.target.value}s hold`}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={[0]}
        renderItem={() => (
          <>
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center flex-1">
                <Pressable onPress={() => router.back()}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color="#38e8ff"
                  />
                </Pressable>
                <Text className="text-primary text-3xl font-bold ml-4">
                  Edit Plan
                </Text>
              </View>
              <Pressable onPress={deletePlan}>
                <MaterialCommunityIcons
                  name="delete"
                  size={24}
                  color="#ef4444"
                />
              </Pressable>
            </View>

            {selectedExercises.length === 0 ? (
              <View className="bg-surface p-8 rounded-xl items-center justify-center border border-border mb-4">
                <MaterialCommunityIcons
                  name="weight-lifter"
                  size={64}
                  color="#7a86a8"
                />
                <Text className="text-text-secondary text-center mt-4 mb-6">
                  No exercises in this plan.{"\n"}Add exercises to get started!
                </Text>
                <Pressable
                  onPress={() => setShowExercisePicker(true)}
                  className="bg-primary px-6 py-3 rounded-xl"
                >
                  <Text className="text-background font-bold">
                    + Add Exercise or Skill
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                {selectedExercises.map((planExercise, index) => {
                  const exercise = exerciseDetails[index];
                  if (!exercise) return null;

                  return (
                    <View
                      key={index}
                      className="bg-surface p-4 rounded-xl mb-3 border border-border"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-text-primary text-lg font-bold">
                            {exercise.name}
                          </Text>
                          <Text className="text-text-secondary text-sm">
                            {exercise.description}
                          </Text>
                        </View>
                        <Pressable onPress={() => removeExercise(index)}>
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={24}
                            color="#ef4444"
                          />
                        </Pressable>
                      </View>

                      {/* Sets Control */}
                      <View className="flex-row items-center mb-2">
                        <Text className="text-text-secondary mr-3 w-12">
                          Sets:
                        </Text>
                        <View className="flex-row items-center bg-surface-elevated rounded-lg">
                          <Pressable
                            onPress={() =>
                              updateSets(index, planExercise.sets - 1)
                            }
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">
                              -
                            </Text>
                          </Pressable>
                          <Text className="text-text-primary font-bold text-lg px-4">
                            {planExercise.sets}
                          </Text>
                          <Pressable
                            onPress={() =>
                              updateSets(index, planExercise.sets + 1)
                            }
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">
                              +
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* Target Control */}
                      <View className="flex-row items-center">
                        <Text className="text-text-secondary mr-3 w-12">
                          {planExercise.target.type === "reps"
                            ? "Reps:"
                            : "Time:"}
                        </Text>
                        <View className="flex-row items-center bg-surface-elevated rounded-lg">
                          <Pressable
                            onPress={() =>
                              updateTarget(index, planExercise.target.value - 1)
                            }
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">
                              -
                            </Text>
                          </Pressable>
                          <Text className="text-text-primary font-bold text-lg px-4">
                            {planExercise.target.value}
                            {planExercise.target.type === "time" ? "s" : ""}
                          </Text>
                          <Pressable
                            onPress={() =>
                              updateTarget(index, planExercise.target.value + 1)
                            }
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">
                              +
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}

                <Pressable
                  onPress={() => setShowExercisePicker(true)}
                  className="bg-surface border-2 border-dashed border-primary p-4 rounded-xl mb-4 items-center"
                >
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={32}
                    color="#38e8ff"
                  />
                  <Text className="text-primary font-bold mt-2">
                    Add More Exercises
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}
      />

      {selectedExercises.length > 0 && (
        <View className="px-6 pb-8 bg-background">
          <Pressable onPress={savePlan} className="bg-primary py-4 rounded-xl">
            <Text className="text-background text-center font-bold text-lg">
              Save Changes
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
