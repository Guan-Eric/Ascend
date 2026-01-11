// types/Skill.ts
export type Skill = {
  id: string;

  name: string; // Handstand, Front Lever, etc.

  description: string;

  progression: {
    exerciseId: string;
    order: number;
  }[];

  unlockCriteria?: {
    minLevel?: "beginner" | "intermediate" | "advanced";
    completedExerciseIds?: string[];
  };

  createdAt: number;
};
