export type PresetSource = {
  name: string;
  url: string;
};

export type PresetExercise = {
  exerciseId: string;
  sets: number;
  target: {
    type: "reps" | "time";
    value: number;
  };
};

export type WorkoutPreset = {
  id: string;
  name: string;
  description: string;
  source: PresetSource;
  level: "beginner" | "intermediate" | "advanced";
  focus: "full_body" | "push" | "pull" | "legs" | "core" | "upper" | "skill";
  durationMinutes: number;
  exercises: PresetExercise[];
};
