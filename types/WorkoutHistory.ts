// types/WorkoutHistory.ts
export type WorkoutHistory = {
    id: string;
    userId: string;
    planId: string;
    dayIndex: number;
    
    exercises: {
      exerciseId: string;
      sets: number;
      completedSets: number;
      target: {
        type: "reps" | "time";
        value: number;
      };
      actualValues: number[]; // Array of actual reps/time for each set
    }[];
    
    completedAt: number;
    duration?: number; // Workout duration in seconds
  };