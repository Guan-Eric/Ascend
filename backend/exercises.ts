// backend/exercises.ts
/**
 * Exercise fetching and management functions
 *
 * PURPOSE: This file helps you RETRIEVE exercise data from Firestore.
 * Think of it as your "exercise search engine" - it finds exercises based on
 * what you need (category, level, equipment, etc.)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { Exercise } from "../types/Exercise";

/**
 * Get a single exercise by ID
 *
 * EXAMPLE: Get the "Standard Push-ups" exercise
 * const exercise = await getExercise('push_standard');
 */
export async function getExercise(
  exerciseId: string
): Promise<Exercise | null> {
  try {
    const docRef = doc(FIRESTORE_DB, "exercises", exerciseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Exercise;
    }
    return null;
  } catch (error) {
    console.error("Error getting exercise:", error);
    throw error;
  }
}

/**
 * Get all exercises
 *
 * EXAMPLE: Get every exercise in the database
 * const exercises = await getAllExercises(); // Returns all 70+ exercises
 */
export async function getAllExercises(): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(FIRESTORE_DB, "exercises");
    const querySnapshot = await getDocs(exercisesRef);

    return querySnapshot.docs.map((doc) => doc.data() as Exercise);
  } catch (error) {
    console.error("Error getting all exercises:", error);
    throw error;
  }
}

/**
 * Get exercises by category
 *
 * EXAMPLE: Get all push exercises (push-ups, dips, etc.)
 * const pushExercises = await getExercisesByCategory('push');
 * // Returns: Wall Push-ups, Knee Push-ups, Standard Push-ups, Diamond Push-ups, etc.
 */
export async function getExercisesByCategory(
  category: Exercise["category"]
): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(FIRESTORE_DB, "exercises");
    const q = query(exercisesRef, where("category", "==", category));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Exercise);
  } catch (error) {
    console.error("Error getting exercises by category:", error);
    throw error;
  }
}

/**
 * Get exercises by level
 *
 * EXAMPLE: Get only beginner exercises for new users
 * const beginnerExercises = await getExercisesByLevel('beginner');
 * // Good for showing users where to start
 */
export async function getExercisesByLevel(
  level: Exercise["level"]
): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(FIRESTORE_DB, "exercises");
    const q = query(exercisesRef, where("level", "==", level));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Exercise);
  } catch (error) {
    console.error("Error getting exercises by level:", error);
    throw error;
  }
}

/**
 * Get exercises by equipment
 *
 * EXAMPLE: User only has a pull-up bar
 * const barExercises = await getExercisesByEquipment('bar');
 * // Returns: Pull-ups, Front Lever, Muscle-ups, etc.
 *
 * EXAMPLE: User has no equipment at all
 * const noEquipment = await getExercisesByEquipment('none');
 * // Returns: Push-ups, Squats, Planks, etc.
 */
export async function getExercisesByEquipment(
  equipment: Exercise["equipment"]
): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(FIRESTORE_DB, "exercises");
    const q = query(exercisesRef, where("equipment", "==", equipment));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Exercise);
  } catch (error) {
    console.error("Error getting exercises by equipment:", error);
    throw error;
  }
}

/**
 * Get beginner exercises (no prerequisites)
 *
 * EXAMPLE: Show new users where to start
 * const starterExercises = await getBeginnerExercises();
 * // Returns exercises that don't require any previous training
 */
export async function getBeginnerExercises(): Promise<Exercise[]> {
  try {
    const allExercises = await getAllExercises();

    return allExercises.filter(
      (ex) =>
        ex.level === "beginner" &&
        (!ex.prerequisites || ex.prerequisites.length === 0)
    );
  } catch (error) {
    console.error("Error getting beginner exercises:", error);
    throw error;
  }
}

/**
 * Get next progression exercise
 *
 * EXAMPLE: User completed "Standard Push-ups", what's next?
 * const next = await getNextProgression('push_standard');
 * // Returns: "Diamond Push-ups" (the next level)
 */
export async function getNextProgression(
  exerciseId: string
): Promise<Exercise | null> {
  try {
    const exercise = await getExercise(exerciseId);

    if (!exercise || !exercise.nextProgressionId) {
      return null;
    }

    return await getExercise(exercise.nextProgressionId);
  } catch (error) {
    console.error("Error getting next progression:", error);
    throw error;
  }
}

/**
 * Get full progression chain for an exercise
 *
 * EXAMPLE: Show user the full push-up journey
 * const chain = await getProgressionChain('push_standard');
 * // Returns: [Standard Push-ups, Diamond Push-ups, Decline Push-ups,
 * //           Pseudo Planche Push-ups, Archer Push-ups, One-Arm Push-ups]
 * // Perfect for showing users their roadmap!
 */
export async function getProgressionChain(
  startExerciseId: string
): Promise<Exercise[]> {
  try {
    const chain: Exercise[] = [];
    let currentId: string | null = startExerciseId;

    while (currentId) {
      const exercise = await getExercise(currentId);

      if (!exercise) break;

      chain.push(exercise);
      currentId = exercise.nextProgressionId || null;
    }

    return chain;
  } catch (error) {
    console.error("Error getting progression chain:", error);
    throw error;
  }
}

/**
 * Check if user can access exercise (has completed prerequisites)
 *
 * EXAMPLE: Can user do Diamond Push-ups?
 * const canDo = await canAccessExercise('push_diamond', completedExerciseIds);
 * // Returns: true if they've completed Standard Push-ups
 * // Returns: false if they haven't
 * // Use this to lock/unlock exercises in your UI
 */
export async function canAccessExercise(
  exerciseId: string,
  completedExerciseIds: string[]
): Promise<boolean> {
  try {
    const exercise = await getExercise(exerciseId);

    if (!exercise) return false;

    // No prerequisites = always accessible
    if (!exercise.prerequisites || exercise.prerequisites.length === 0) {
      return true;
    }

    // Check if all prerequisites are completed
    return exercise.prerequisites.every((prereqId) =>
      completedExerciseIds.includes(prereqId)
    );
  } catch (error) {
    console.error("Error checking exercise access:", error);
    return false;
  }
}

/**
 * Get multiple exercises by IDs
 *
 * EXAMPLE: Get specific exercises for a workout plan
 * const exercises = await getExercisesByIds(['push_standard', 'pull_strict', 'core_plank']);
 * // Returns: [Standard Push-ups, Strict Pull-ups, Plank]
 */
export async function getExercisesByIds(
  exerciseIds: string[]
): Promise<Exercise[]> {
  try {
    const exercises: Exercise[] = [];

    for (const id of exerciseIds) {
      const exercise = await getExercise(id);
      if (exercise) {
        exercises.push(exercise);
      }
    }

    return exercises;
  } catch (error) {
    console.error("Error getting exercises by IDs:", error);
    throw error;
  }
}
