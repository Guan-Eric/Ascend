// types/Plan.ts
export type Plan = {
  id: string;

  userId: string;

  goalId: string; // skillId or strength path

  dayIndex: number; // 1–7

  exercises: {
    exerciseId: string;
    sets: number;
    target: {
      type: "reps" | "time";
      value: number;
    };
  }[];

  completed: boolean;

  createdAt: number;
};
