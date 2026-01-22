// types/User.ts - Updated with auto-progression setting
export type User = {
  id: string;
  email: string;
  createdAt: number;
  goalType: "skill" | "strength";
  primaryGoalId: string;
  level: "beginner" | "intermediate" | "advanced";
  trainingDaysPerWeek: number;
  autoProgressExercises: boolean; // New field for automatic progression
};