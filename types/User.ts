// types/User.ts
export type User = {
  id: string; // Firebase UID
  email: string;

  goalType: "skill" | "strength";
  primaryGoalId: string; // skillId or strengthPathId

  level: "beginner" | "intermediate" | "advanced";

  trainingDaysPerWeek: number;

  createdAt: number;
  updatedAt: number;
};
