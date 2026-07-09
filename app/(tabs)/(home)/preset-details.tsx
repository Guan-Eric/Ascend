import { View, Text, Alert, Linking } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../../../config/firebase";
import * as backend from "../../../backend";
import { Exercise } from "../../../types/Exercise";
import { WorkoutPreset } from "../../../types/WorkoutPreset";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

const DAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function PresetDetailsScreen() {
  const { presetId } = useLocalSearchParams<{ presetId: string }>();
  const [preset, setPreset] = useState<WorkoutPreset | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const primaryColor = useThemeColor("primary");

  useFocusEffect(
    useCallback(() => {
      loadPreset();
    }, [presetId])
  );

  const loadPreset = async () => {
    if (!presetId) return;

    try {
      const data = await backend.getWorkoutPresetWithExercises(presetId);
      if (data) {
        setPreset(data.preset);
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error("Error loading preset:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToSchedule = async () => {
    if (!preset || selectedDay === null) {
      setShowDayPicker(true);
      return;
    }

    try {
      setSaving(true);
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      await backend.createPlanFromPreset(userId, preset.id, selectedDay);

      Alert.alert("Added!", `${preset.name} is now on your schedule.`, [
        { text: "View Workouts", onPress: () => router.replace("/(tabs)/(home)") },
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error adding preset:", error);
      Alert.alert("Error", "Failed to add workout preset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
      </View>
    );
  }

  if (!preset) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-text-primary text-lg font-bold mb-4">
          Preset not found
        </Text>
        <AnimatedPressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-background font-bold">Go Back</Text>
        </AnimatedPressable>
      </View>
    );
  }

  if (showDayPicker) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pt-16 pb-4">
          <AnimatedPressable
            onPress={() => setShowDayPicker(false)}
            className="mb-4"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={primaryColor}
            />
          </AnimatedPressable>
          <Text className="text-primary text-3xl font-bold mb-2">
            Choose Training Day
          </Text>
          <Text className="text-text-secondary mb-6">
            Which day should this preset be scheduled for?
          </Text>
        </View>

        <FlashList
          className="flex-1 px-6"
          data={[1, 2, 3, 4, 5, 6, 7]}
          renderItem={({ item: day, index }) => (
            <FadeSlideIn delay={Math.min(index * 50, 300)}>
              <AnimatedPressable
                onPress={() => {
                  setSelectedDay(day);
                  setShowDayPicker(false);
                }}
                className="card-frosted p-5 rounded-2xl mb-3 shadow-elevated"
              >
                <Text className="text-text-primary text-xl font-bold">
                  {DAY_NAMES[day]}
                </Text>
              </AnimatedPressable>
            </FadeSlideIn>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        className="flex-1 px-6 pt-16"
        data={exercises}
        ListHeaderComponent={
          <View className="mb-4">
            <AnimatedPressable onPress={() => router.back()} className="mb-4">
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={primaryColor}
              />
            </AnimatedPressable>

            <Text className="text-primary text-3xl font-bold mb-2">
              {preset.name}
            </Text>
            <Text className="text-text-secondary text-base leading-6 mb-4">
              {preset.description}
            </Text>

            <AnimatedPressable
              onPress={() => Linking.openURL(preset.source.url)}
              className="flex-row items-center bg-surface-elevated px-4 py-3 rounded-2xl mb-4"
            >
              <MaterialCommunityIcons
                name="open-in-new"
                size={18}
                color={primaryColor}
              />
              <Text className="text-primary font-semibold ml-2">
                Source: {preset.source.name}
              </Text>
            </AnimatedPressable>

            <View className="flex-row flex-wrap gap-2 mb-6">
              <View className="bg-primary/15 px-3 py-1 rounded-full">
                <Text className="text-primary text-xs font-semibold capitalize">
                  {preset.level}
                </Text>
              </View>
              <View className="bg-surface-elevated px-3 py-1 rounded-full">
                <Text className="text-text-secondary text-xs font-semibold">
                  ~{preset.durationMinutes} min
                </Text>
              </View>
              <View className="bg-surface-elevated px-3 py-1 rounded-full">
                <Text className="text-text-secondary text-xs font-semibold">
                  {preset.exercises.length} exercises
                </Text>
              </View>
            </View>

            <Text className="text-text-secondary text-sm font-semibold mb-3 uppercase">
              Exercises
            </Text>
          </View>
        }
        renderItem={({ item: exercise, index }) => {
          const presetExercise = preset.exercises.find(
            (entry) => entry.exerciseId === exercise.id
          );
          if (!presetExercise) return null;

          return (
            <FadeSlideIn delay={Math.min(index * 40, 200)}>
              <View className="card-frosted p-4 rounded-2xl mb-3">
                <View className="flex-row items-center">
                  <View className="bg-primary/10 w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Text className="text-primary font-bold">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-lg font-bold mb-1">
                      {exercise.name}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {presetExercise.sets} sets × {presetExercise.target.value}{" "}
                      {presetExercise.target.type === "reps" ? "reps" : "sec"}
                    </Text>
                  </View>
                </View>
              </View>
            </FadeSlideIn>
          );
        }}
        keyExtractor={(item) => item.id}
      />

      <View className="px-6 pb-8 bg-background">
        {selectedDay !== null && (
          <AnimatedPressable
            onPress={() => setShowDayPicker(true)}
            className="mb-3"
          >
            <Text className="text-text-secondary text-center">
              Scheduled for{" "}
              <Text className="text-primary font-semibold">
                {DAY_NAMES[selectedDay]}
              </Text>{" "}
              · Tap to change
            </Text>
          </AnimatedPressable>
        )}

        <AnimatedPressable
          onPress={addToSchedule}
          disabled={saving}
          className="bg-primary py-4 rounded-2xl shadow-elevated"
        >
          <View className="flex-row items-center justify-center">
            <MaterialCommunityIcons name="plus" size={22} color="#000000" />
            <Text className="text-background font-bold text-lg ml-2">
              {saving
                ? "Adding..."
                : selectedDay === null
                  ? "Choose Day & Add"
                  : "Add to My Workouts"}
            </Text>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}
