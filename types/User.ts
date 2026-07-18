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
  /** Set after onboarding auto-plan generation runs once */
  initialPlansGenerated?: boolean;
  /** Single free Day-1 plan created after onboarding (before paywall) */
  samplePlanId?: string;
  /** True after the free sample workout is finished */
  sampleWorkoutCompleted?: boolean;
};