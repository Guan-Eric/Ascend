// types/Progress.ts
export type Progress = {
  userId: string;
  exerciseId: string;

  bestValue: number; // max reps or seconds
  lastCompletedAt: number;
};
