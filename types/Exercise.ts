// types/Exercise.ts
export type Exercise = {
  id: string;

  name: string;
  description: string;

  category: "push" | "pull" | "legs" | "core" | "skill" | "mobility";

  level: "beginner" | "intermediate" | "advanced";

  equipment: "none" | "bar" | "rings" | "parallettes";

  target: {
    type: "reps" | "time";
    value: number; // reps or seconds
  };

  prerequisites?: string[]; // exercise IDs

  nextProgressionId?: string;

  createdAt: number;
};
