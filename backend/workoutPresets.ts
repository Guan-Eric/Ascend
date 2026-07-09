import { workoutPresets } from "../data/workoutPresets";
import { Exercise } from "../types/Exercise";
import { WorkoutPreset } from "../types/WorkoutPreset";
import { getExercise } from "./exercises";
import { createPlan } from "./plans";

export async function getAllWorkoutPresets(): Promise<WorkoutPreset[]> {
  return workoutPresets;
}

export async function getWorkoutPreset(
  presetId: string
): Promise<WorkoutPreset | null> {
  return workoutPresets.find((preset) => preset.id === presetId) ?? null;
}

export async function getWorkoutPresetWithExercises(
  presetId: string
): Promise<{ preset: WorkoutPreset; exercises: Exercise[] } | null> {
  const preset = await getWorkoutPreset(presetId);
  if (!preset) return null;

  const exercises = (
    await Promise.all(
      preset.exercises.map((entry) => getExercise(entry.exerciseId))
    )
  ).filter((exercise): exercise is Exercise => exercise !== null);

  return { preset, exercises };
}

export async function createPlanFromPreset(
  userId: string,
  presetId: string,
  dayIndex: number
): Promise<string> {
  const preset = await getWorkoutPreset(presetId);
  if (!preset) {
    throw new Error("Workout preset not found");
  }

  return createPlan({
    userId,
    goalId: `preset:${presetId}`,
    dayIndex,
    exercises: preset.exercises,
    completed: false,
    createdAt: Date.now(),
  });
}

export function getPresetSources(): string[] {
  const sources = new Set(workoutPresets.map((preset) => preset.source.name));
  return Array.from(sources).sort();
}
