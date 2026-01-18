import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
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

type ViewMode = "main" | "dayPicker" | "exercisePicker" | "skillPicker" | "strengthPicker";

export default function CreatePlanScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("dayPicker");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [strengthPaths, setStrengthPaths] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillExercises, setSkillExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const exercises = await backend.getAllExercises();
      const skills = await backend.getAllSkills();
      const paths = await backend.getAllStrengthPaths();
      setAllExercises(exercises);
      setAllSkills(skills);
      setStrengthPaths(paths);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadSkillExercises = async (skillId: string) => {
    try {
      const skillData = await backend.getSkillWithExercises(skillId);
      if (skillData) {
        setSelectedSkill(skillData.skill);
        setSkillExercises(skillData.exercises);
        setViewMode("skillPicker");
      }
    } catch (error) {
      console.error("Error loading skill exercises:", error);
    }
  };

  const loadStrengthExercises = async (pathId: string) => {
    try {
      const pathData = await backend.getStrengthPathWithExercises(pathId);
      if (pathData) {
        setSelectedSkill(pathData.path);
        setSkillExercises(pathData.exercises);
        setViewMode("strengthPicker");
      }
    } catch (error) {
      console.error("Error loading strength exercises:", error);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newExercise: PlanExercise = {
      exerciseId: exercise.id,
      sets: 3,
      target: exercise.target,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setViewMode("main");
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateSets = (index: number, sets: number) => {
    const updated = [...selectedExercises];
    updated[index].sets = Math.max(1, sets);
    setSelectedExercises(updated);
  };

  const savePlan = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      if (selectedExercises.length === 0) {
        Alert.alert("Error", "Please add at least one exercise");
        return;
      }

      await backend.createPlan({
        userId,
        goalId: "custom",
        dayIndex: selectedDay,
        exercises: selectedExercises,
        completed: false,
        createdAt: Date.now(),
      });

      Alert.alert("Success", "Workout plan created!");
      router.back();
    } catch (error) {
      console.error("Error saving plan:", error);
      Alert.alert("Error", "Failed to save plan");
    }
  };

  const getDayName = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day] || `Day ${day}`;
  };

  // DAY PICKER VIEW
  if (viewMode === "dayPicker") {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => router.back()} className="mb-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-3xl font-bold mb-2">
            Choose Training Day
          </Text>
          <Text className="text-text-secondary mb-6">
            Select which day this workout plan is for
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={[0, 1, 2, 3, 4, 5, 6]}
          renderItem={({ item: day }) => (
            <Pressable
              onPress={() => {
                setSelectedDay(day);
                setViewMode("main");
              }}
              className="bg-surface p-5 rounded-xl mb-3 border-2 border-border"
            >
              <Text className="text-text-primary text-xl font-bold">
                {getDayName(day)}
              </Text>
            </Pressable>
          )}
        />
      </View>
    );
  }

  // SKILL EXERCISE PICKER
  if (viewMode === "skillPicker" && selectedSkill) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => setViewMode("main")} className="mb-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-2xl font-bold mb-1">
            {selectedSkill.name}
          </Text>
          <Text className="text-text-secondary mb-4">
            Select exercises from this skill progression
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={skillExercises}
          renderItem={({ item: exercise }) => (
            <Pressable
              onPress={() => addExercise(exercise)}
              className="bg-surface p-4 rounded-xl mb-3 border border-border"
            >
              <Text className="text-text-primary text-lg font-bold mb-1">
                {exercise.name}
              </Text>
              <Text className="text-text-secondary text-sm mb-2">
                {exercise.description}
              </Text>
              <View className="flex-row gap-2">
                <View className="bg-surface-elevated px-3 py-1 rounded">
                  <Text className="text-text-secondary text-xs capitalize">
                    {exercise.level}
                  </Text>
                </View>
                <View className="bg-surface-elevated px-3 py-1 rounded">
                  <Text className="text-text-secondary text-xs">
                    {exercise.target.value} {exercise.target.type === "reps" ? "reps" : "sec"}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }

  // STRENGTH PATH PICKER
  if (viewMode === "strengthPicker" && selectedSkill) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => setViewMode("main")} className="mb-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-2xl font-bold mb-1">
            {selectedSkill.name}
          </Text>
          <Text className="text-text-secondary mb-4">
            Select exercises from this strength path
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={skillExercises}
          renderItem={({ item: exercise }) => (
            <Pressable
              onPress={() => addExercise(exercise)}
              className="bg-surface p-4 rounded-xl mb-3 border border-border"
            >
              <Text className="text-text-primary text-lg font-bold mb-1">
                {exercise.name}
              </Text>
              <Text className="text-text-secondary text-sm mb-2">
                {exercise.description}
              </Text>
              <View className="flex-row gap-2">
                <View className="bg-surface-elevated px-3 py-1 rounded">
                  <Text className="text-text-secondary text-xs capitalize">
                    {exercise.level}
                  </Text>
                </View>
                <View className="bg-surface-elevated px-3 py-1 rounded">
                  <Text className="text-text-secondary text-xs">
                    {exercise.target.value} {exercise.target.type === "reps" ? "reps" : "sec"}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }

  // EXERCISE TYPE PICKER
  if (viewMode === "exercisePicker") {
    const filteredExercises = allExercises.filter((ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <Pressable onPress={() => setViewMode("main")} className="mb-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-2xl font-bold mb-4">
            Browse All Exercises
          </Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            placeholderTextColor="#7a86a8"
            className="bg-surface text-text-primary px-4 py-3 rounded-xl mb-4"
          />
        </View>

        <FlashList
          className="flex-1 px-6"
          data={filteredExercises}
          renderItem={({ item: exercise }) => (
            <Pressable
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
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }

  // MAIN VIEW - Building the plan
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#38e8ff" />
          </Pressable>
          <Text className="text-primary text-2xl font-bold ml-4">
            {getDayName(selectedDay)} Workout
          </Text>
          <Pressable
            onPress={() => setViewMode("dayPicker")}
            className="ml-auto"
          >
            <Text className="text-primary text-sm">Change Day</Text>
          </Pressable>
        </View>
      </View>

      <FlashList
        className="flex-1 px-6"
        data={[0]}
        renderItem={() => (
          <>
            {/* Add Exercise Options */}
            <View className="mb-4">
              <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
                Add Exercises
              </Text>

              <Pressable
                onPress={() => setViewMode("exercisePicker")}
                className="bg-surface p-4 rounded-xl mb-3 border border-border flex-row items-center"
              >
                <MaterialCommunityIcons name="dumbbell" size={24} color="#38e8ff" />
                <View className="ml-3 flex-1">
                  <Text className="text-text-primary font-bold text-base">
                    Browse All Exercises
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    Add individual exercises
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
              </Pressable>

              {/* Skills Section */}
              <Text className="text-text-secondary text-xs font-semibold mb-2 mt-4 uppercase">
                Skills
              </Text>
              {allSkills.map((skill) => (
                <Pressable
                  key={skill.id}
                  onPress={() => loadSkillExercises(skill.id)}
                  className="bg-surface p-4 rounded-xl mb-2 border border-border flex-row items-center"
                >
                  <MaterialCommunityIcons name="medal-outline" size={24} color="#38e8ff" />
                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-bold">
                      {skill.name}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {skill.progression.length} exercises
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                </Pressable>
              ))}

              {/* Strength Paths */}
              <Text className="text-text-secondary text-xs font-semibold mb-2 mt-4 uppercase">
                Strength Paths
              </Text>
              {strengthPaths.map((path) => (
                <Pressable
                  key={path.id}
                  onPress={() => loadStrengthExercises(path.id)}
                  className="bg-surface p-4 rounded-xl mb-2 border border-border flex-row items-center"
                >
                  <MaterialCommunityIcons name="arm-flex" size={24} color="#38e8ff" />
                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-bold">
                      {path.name}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {path.progression.length} exercises
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#7a86a8" />
                </Pressable>
              ))}
            </View>

            {/* Selected Exercises */}
            {selectedExercises.length > 0 && (
              <>
                <Text className="text-text-secondary text-sm font-semibold mb-3 mt-6 uppercase">
                  Selected Exercises ({selectedExercises.length})
                </Text>

                {selectedExercises.map((planExercise, index) => {
                  const exercise = allExercises.find(
                    (ex) => ex.id === planExercise.exerciseId
                  );
                  if (!exercise) return null;

                  return (
                    <View
                      key={index}
                      className="bg-surface p-4 rounded-xl mb-3 border border-border"
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="text-text-primary text-lg font-bold">
                            {exercise.name}
                          </Text>
                          <Text className="text-text-secondary text-sm">
                            {planExercise.target.type === "reps"
                              ? `${planExercise.target.value} reps`
                              : `${planExercise.target.value}s`}
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

                      <View className="flex-row items-center mt-2">
                        <Text className="text-text-secondary mr-3">Sets:</Text>
                        <View className="flex-row items-center bg-surface-elevated rounded-lg">
                          <Pressable
                            onPress={() => updateSets(index, planExercise.sets - 1)}
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">-</Text>
                          </Pressable>
                          <Text className="text-text-primary font-bold text-lg px-4">
                            {planExercise.sets}
                          </Text>
                          <Pressable
                            onPress={() => updateSets(index, planExercise.sets + 1)}
                            className="px-4 py-2"
                          >
                            <Text className="text-primary text-xl font-bold">+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      />

      {selectedExercises.length > 0 && (
        <View className="px-6 pb-8 bg-background">
          <Pressable onPress={savePlan} className="bg-primary py-4 rounded-xl">
            <Text className="text-background text-center font-bold text-lg">
              Save Workout Plan
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}