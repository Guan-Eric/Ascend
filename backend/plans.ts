// backend/plans.ts
/**
 * Workout plan creation and management functions
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { Plan } from "../types/Plan";
import { Exercise } from "../types/Exercise";
import { getSkillWithExercises, getStrengthPathWithExercises } from "./skills";
import { getCompletedExerciseIds } from "./progress";
import { getUser } from "./users";

/**
 * Create a new workout plan
 */
export async function createPlan(planData: Omit<Plan, "id">): Promise<string> {
  try {
    const plansRef = collection(FIRESTORE_DB, "plans");
    const newPlanRef = doc(plansRef);

    const plan: Plan = {
      id: newPlanRef.id,
      ...planData,
    };

    await setDoc(newPlanRef, plan);
    console.log("✅ Plan created:", newPlanRef.id);

    return newPlanRef.id;
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
}

/**
 * Get a single plan by ID
 */
export async function getPlan(planId: string): Promise<Plan | null> {
  try {
    const docRef = doc(FIRESTORE_DB, "plans", planId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Plan;
    }
    return null;
  } catch (error) {
    console.error("Error getting plan:", error);
    throw error;
  }
}

/**
 * Get all plans for a user
 */
export async function getUserPlans(userId: string): Promise<Plan[]> {
  try {
    const plansRef = collection(FIRESTORE_DB, "plans");
    const q = query(
      plansRef,
      where("userId", "==", userId),
      orderBy("dayIndex", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Plan);
  } catch (error) {
    console.error("Error getting user plans:", error);
    throw error;
  }
}

/**
 * Get plan for specific day
 */
export async function getPlanForDay(
  userId: string,
  dayIndex: number
): Promise<Plan | null> {
  try {
    const plansRef = collection(FIRESTORE_DB, "plans");
    const q = query(
      plansRef,
      where("userId", "==", userId),
      where("dayIndex", "==", dayIndex)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Plan;
  } catch (error) {
    console.error("Error getting plan for day:", error);
    throw error;
  }
}

/**
 * Mark plan as completed
 */
export async function markPlanCompleted(planId: string): Promise<void> {
  try {
    const planRef = doc(FIRESTORE_DB, "plans", planId);
    await updateDoc(planRef, { completed: true });

    console.log("✅ Plan marked as completed:", planId);
  } catch (error) {
    console.error("Error marking plan completed:", error);
    throw error;
  }
}

/**
 * Delete a plan
 */
export async function deletePlan(planId: string): Promise<void> {
  try {
    const planRef = doc(FIRESTORE_DB, "plans", planId);
    await deleteDoc(planRef);

    console.log("✅ Plan deleted:", planId);
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
}

/**
 * Delete all plans for a user
 */
export async function deleteAllUserPlans(userId: string): Promise<void> {
  try {
    const plans = await getUserPlans(userId);

    for (const plan of plans) {
      await deletePlan(plan.id);
    }

    console.log("✅ All user plans deleted");
  } catch (error) {
    console.error("Error deleting all user plans:", error);
    throw error;
  }
}

/**
 * Generate workout plan based on user's goal
 */
export async function generateWorkoutPlan(userId: string): Promise<Plan[]> {
  try {
    const user = await getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const completedExerciseIds = await getCompletedExerciseIds(userId);
    const plans: Plan[] = [];

    // Get the skill or strength path
    let exercises: Exercise[] = [];

    if (user.goalType === "skill") {
      const skillData = await getSkillWithExercises(user.primaryGoalId);
      if (skillData) {
        exercises = skillData.exercises;
      }
    } else {
      const pathData = await getStrengthPathWithExercises(user.primaryGoalId);
      if (pathData) {
        exercises = pathData.exercises;
      }
    }

    if (exercises.length === 0) {
      throw new Error("No exercises found for goal");
    }

    // Find current progression level
    let currentExerciseIndex = 0;
    for (let i = 0; i < exercises.length; i++) {
      if (!completedExerciseIds.includes(exercises[i].id)) {
        currentExerciseIndex = i;
        break;
      }
    }

    // Generate plans for training days
    const daysPerWeek = user.trainingDaysPerWeek;

    for (let day = 1; day <= daysPerWeek; day++) {
      const currentExercise = exercises[currentExerciseIndex];

      const planData: Omit<Plan, "id"> = {
        userId,
        goalId: user.primaryGoalId,
        dayIndex: day,
        exercises: [
          {
            exerciseId: currentExercise.id,
            sets: 3,
            target: currentExercise.target,
          },
        ],
        completed: false,
        createdAt: Date.now(),
      };

      const planId = await createPlan(planData);
      const plan = await getPlan(planId);
      if (plan) {
        plans.push(plan);
      }
    }

    console.log(`✅ Generated ${plans.length} workout plans`);
    return plans;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
}

/**
 * Regenerate plans for user (delete old and create new)
 */
export async function regenerateWorkoutPlan(userId: string): Promise<Plan[]> {
  try {
    // Delete existing plans
    await deleteAllUserPlans(userId);

    // Generate new plans
    return await generateWorkoutPlan(userId);
  } catch (error) {
    console.error("Error regenerating workout plan:", error);
    throw error;
  }
}

/**
 * Get today's workout plan
 */
export async function getTodaysPlan(userId: string): Promise<Plan | null> {
  try {
    const today = new Date().getDay(); // 0-6 (Sunday-Saturday)
    const dayIndex = today === 0 ? 7 : today; // Convert to 1-7

    return await getPlanForDay(userId, dayIndex);
  } catch (error) {
    console.error("Error getting today's plan:", error);
    throw error;
  }
}

/**
 * Get upcoming plans (not completed)
 */
export async function getUpcomingPlans(userId: string): Promise<Plan[]> {
  try {
    const plansRef = collection(FIRESTORE_DB, "plans");
    const q = query(
      plansRef,
      where("userId", "==", userId),
      where("completed", "==", false),
      orderBy("dayIndex", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Plan);
  } catch (error) {
    console.error("Error getting upcoming plans:", error);
    throw error;
  }
}

/**
 * Get completed plans
 */
export async function getCompletedPlans(userId: string): Promise<Plan[]> {
  try {
    const plansRef = collection(FIRESTORE_DB, "plans");
    const q = query(
      plansRef,
      where("userId", "==", userId),
      where("completed", "==", true),
      orderBy("dayIndex", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Plan);
  } catch (error) {
    console.error("Error getting completed plans:", error);
    throw error;
  }
}
