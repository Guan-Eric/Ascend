import { View, Text, TextInput, Linking } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as backend from "../../../backend";
import { WorkoutPreset } from "../../../types/WorkoutPreset";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

type FilterLevel = "all" | "beginner" | "intermediate" | "advanced";

const FOCUS_LABELS: Record<WorkoutPreset["focus"], string> = {
  full_body: "Full Body",
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  core: "Core",
  upper: "Upper Body",
  skill: "Skill",
};

export default function WorkoutPresetsScreen() {
  const [presets, setPresets] = useState<WorkoutPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const primaryColor = useThemeColor("primary");

  useFocusEffect(
    useCallback(() => {
      loadPresets();
    }, [])
  );

  const loadPresets = async () => {
    try {
      const data = await backend.getAllWorkoutPresets();
      setPresets(data);
    } catch (error) {
      console.error("Error loading workout presets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPresets = useMemo(() => {
    return presets.filter((preset) => {
      const matchesLevel =
        levelFilter === "all" || preset.level === levelFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        preset.name.toLowerCase().includes(query) ||
        preset.description.toLowerCase().includes(query) ||
        preset.source.name.toLowerCase().includes(query);
      return matchesLevel && matchesSearch;
    });
  }, [presets, levelFilter, searchQuery]);

  const renderPresetCard = (preset: WorkoutPreset, index: number) => (
    <FadeSlideIn delay={Math.min(index * 50, 300)}>
      <AnimatedPressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(home)/preset-details",
            params: { presetId: preset.id },
          })
        }
        className="card-frosted p-5 rounded-3xl mb-4 shadow-elevated"
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-text-primary text-xl font-bold mb-1">
              {preset.name}
            </Text>
            <Text className="text-text-secondary text-sm leading-5">
              {preset.description}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#7a86a8"
          />
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3">
          <View className="bg-primary/15 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-semibold capitalize">
              {preset.level}
            </Text>
          </View>
          <View className="bg-surface-elevated px-3 py-1 rounded-full">
            <Text className="text-text-secondary text-xs font-semibold">
              {FOCUS_LABELS[preset.focus]}
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

        <AnimatedPressable
          onPress={() => Linking.openURL(preset.source.url)}
          className="flex-row items-center mt-4"
        >
          <MaterialCommunityIcons
            name="link-variant"
            size={16}
            color={primaryColor}
          />
          <Text className="text-primary text-sm font-semibold ml-1">
            {preset.source.name}
          </Text>
        </AnimatedPressable>
      </AnimatedPressable>
    </FadeSlideIn>
  );

  const renderListHeader = () => (
    <View className="mb-4">
      <AnimatedPressable onPress={() => router.back()} className="mb-4">
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={primaryColor}
        />
      </AnimatedPressable>

      <Text className="text-primary text-4xl font-bold mb-2">
        Workout Presets
      </Text>
      <Text className="text-text-secondary text-base mb-6 leading-6">
        Curated routines from popular online calisthenics programs. Pick one and
        add it to your schedule.
      </Text>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search presets or sources..."
        placeholderTextColor="#7a86a8"
        className="bg-surface text-text-primary px-4 py-3 rounded-xl mb-4"
      />

      <View className="flex-row flex-wrap gap-2 mb-2">
        {(["all", "beginner", "intermediate", "advanced"] as FilterLevel[]).map(
          (level) => (
            <AnimatedPressable
              key={level}
              onPress={() => setLevelFilter(level)}
              className={`px-4 py-2 rounded-full ${
                levelFilter === level
                  ? "bg-primary"
                  : "bg-surface-elevated border border-border/40"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  levelFilter === level
                    ? "text-background"
                    : "text-text-secondary"
                }`}
              >
                {level === "all" ? "All Levels" : level}
              </Text>
            </AnimatedPressable>
          )
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LoadingSpinner size={64} />
        <Text className="text-text-secondary mt-4">Loading presets...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        className="flex-1 px-6 pt-16"
        data={filteredPresets}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item, index }) => renderPresetCard(item, index)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="card-frosted p-8 rounded-3xl items-center">
            <Text className="text-text-primary text-lg font-bold mb-2">
              No presets found
            </Text>
            <Text className="text-text-secondary text-center">
              Try a different search or filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}
