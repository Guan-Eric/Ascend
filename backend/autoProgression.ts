// backend/autoProgression.ts - New file for auto-progression logic
import { Plan } from "../types/Plan";
import { Exercise } from "../types/Exercise";
import { getExercise } from "./exercises";
import { getPlan, updatePlan } from "./plans";

/**
 * Check if an exercise should be auto-progressed and return the next exercise
 */
export async function checkAutoProgression(
  exerciseId: string,
  bestValue: number
): Promise<Exercise | null> {
  try {
    const exercise = await getExercise(exerciseId);
    if (!exercise) return null;

    // Check if user hit the target
    if (bestValue >= exercise.target.value) {
      // Check if there's a next progression
      if (exercise.nextProgressionId) {
        const nextExercise = await getExercise(exercise.nextProgressionId);
        return nextExercise;
      }
    }

    return null;
  } catch (error) {
    console.error("Error checking auto progression:", error);
    return null;
  }
}

/**
 * Auto-progress exercises in user's active plans
 */
export async function autoProgressPlans(
  userId: string,
  completedExerciseId: string,
  nextExerciseId: string
): Promise<{ updatedPlans: string[]; planNames: string[] }> {
  try {
    const updatedPlans: string[] = [];
    const planNames: string[] = [];

    // Get all user plans (you'll need to implement getUserPlans if not already done)
    const { getUserPlans } = await import("./plans");
    const userPlans = await getUserPlans(userId);

    for (const plan of userPlans) {
      let hasUpdate = false;
      const updatedExercises = plan.exercises.map((ex) => {
        if (ex.exerciseId === completedExerciseId) {
          hasUpdate = true;
          return {
            ...ex,
            exerciseId: nextExerciseId,
          };
        }
        return ex;
      });

      if (hasUpdate) {
        await updatePlan(plan.id, {
          exercises: updatedExercises,
        });
        updatedPlans.push(plan.id);
        
        // Generate a friendly plan name
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        planNames.push(`${days[plan.dayIndex]} Workout`);
      }
    }

    return { updatedPlans, planNames };
  } catch (error) {
    console.error("Error auto-progressing plans:", error);
    return { updatedPlans: [], planNames: [] };
  }
}