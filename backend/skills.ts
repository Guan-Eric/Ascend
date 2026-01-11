// backend/skills.ts
/**
 * Skills and strength paths management functions
 *
 * PURPOSE: This file helps you work with SKILLS (like Handstand, Front Lever)
 * and STRENGTH PATHS (like Push Strength, Pull Strength).
 *
 * Think of skills as "goals" that users work towards, made up of multiple exercises.
 */

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { Skill } from "../types/Skill";
import { Exercise } from "../types/Exercise";
import { getExercise } from "./exercises";

/**
 * Get a single skill by ID
 *
 * EXAMPLE: Get the Handstand skill
 * const skill = await getSkill('handstand');
 * // Returns: { name: "Handstand", progression: [...7 exercises], ... }
 */
export async function getSkill(skillId: string): Promise<Skill | null> {
  try {
    const docRef = doc(FIRESTORE_DB, "skills", skillId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Skill;
    }
    return null;
  } catch (error) {
    console.error("Error getting skill:", error);
    throw error;
  }
}

/**
 * Get all skills
 *
 * EXAMPLE: Show user all available skills to choose from
 * const skills = await getAllSkills();
 * // Returns: [Handstand, Front Lever, Muscle-Up, L-Sit, Planche]
 */
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const skillsRef = collection(FIRESTORE_DB, "skills");
    const querySnapshot = await getDocs(skillsRef);

    return querySnapshot.docs.map((doc) => doc.data() as Skill);
  } catch (error) {
    console.error("Error getting all skills:", error);
    throw error;
  }
}

/**
 * Get a single strength path by ID
 *
 * EXAMPLE: Get the Push Strength path
 * const path = await getStrengthPath('push_strength');
 * // Returns: { name: "Push Strength", progression: [...8 exercises], ... }
 */
export async function getStrengthPath(pathId: string): Promise<Skill | null> {
  try {
    const docRef = doc(FIRESTORE_DB, "strengthPaths", pathId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Skill;
    }
    return null;
  } catch (error) {
    console.error("Error getting strength path:", error);
    throw error;
  }
}

/**
 * Get all strength paths
 *
 * EXAMPLE: Show user strength path options
 * const paths = await getAllStrengthPaths();
 * // Returns: [Push Strength, Pull Strength, Leg Strength, Core Strength]
 */
export async function getAllStrengthPaths(): Promise<Skill[]> {
  try {
    const pathsRef = collection(FIRESTORE_DB, "strengthPaths");
    const querySnapshot = await getDocs(pathsRef);

    return querySnapshot.docs.map((doc) => doc.data() as Skill);
  } catch (error) {
    console.error("Error getting all strength paths:", error);
    throw error;
  }
}

/**
 * Get skill progression with full exercise details
 *
 * EXAMPLE: Show user the complete Handstand roadmap
 * const { skill, exercises } = await getSkillWithExercises('handstand');
 *
 * skill = { name: "Handstand", description: "...", ... }
 * exercises = [
 *   { name: "Wall Plank", target: { type: "time", value: 30 }, ... },
 *   { name: "Wall Walk", target: { type: "reps", value: 5 }, ... },
 *   { name: "Chest-to-Wall Handstand", ... },
 *   // ... 4 more exercises
 * ]
 *
 * Use this to display the full progression path to users!
 */
export async function getSkillWithExercises(skillId: string): Promise<{
  skill: Skill;
  exercises: Exercise[];
} | null> {
  try {
    const skill = await getSkill(skillId);

    if (!skill) return null;

    // Fetch all exercises in the progression
    const exercises: Exercise[] = [];

    for (const progression of skill.progression) {
      const exercise = await getExercise(progression.exerciseId);
      if (exercise) {
        exercises.push(exercise);
      }
    }

    // Sort by progression order (1, 2, 3, ...)
    exercises.sort((a, b) => {
      const orderA =
        skill.progression.find((p) => p.exerciseId === a.id)?.order || 0;
      const orderB =
        skill.progression.find((p) => p.exerciseId === b.id)?.order || 0;
      return orderA - orderB;
    });

    return { skill, exercises };
  } catch (error) {
    console.error("Error getting skill with exercises:", error);
    throw error;
  }
}

/**
 * Get strength path with full exercise details
 *
 * EXAMPLE: Show user the complete Push Strength journey
 * const { path, exercises } = await getStrengthPathWithExercises('push_strength');
 *
 * path = { name: "Push Strength", description: "...", ... }
 * exercises = [
 *   { name: "Wall Push-ups", ... },
 *   { name: "Knee Push-ups", ... },
 *   { name: "Standard Push-ups", ... },
 *   // ... 5 more exercises
 * ]
 */
export async function getStrengthPathWithExercises(pathId: string): Promise<{
  path: Skill;
  exercises: Exercise[];
} | null> {
  try {
    const path = await getStrengthPath(pathId);

    if (!path) return null;

    // Fetch all exercises in the progression
    const exercises: Exercise[] = [];

    for (const progression of path.progression) {
      const exercise = await getExercise(progression.exerciseId);
      if (exercise) {
        exercises.push(exercise);
      }
    }

    // Sort by progression order
    exercises.sort((a, b) => {
      const orderA =
        path.progression.find((p) => p.exerciseId === a.id)?.order || 0;
      const orderB =
        path.progression.find((p) => p.exerciseId === b.id)?.order || 0;
      return orderA - orderB;
    });

    return { path, exercises };
  } catch (error) {
    console.error("Error getting strength path with exercises:", error);
    throw error;
  }
}

/**
 * Check if user can access skill (meets unlock criteria)
 *
 * EXAMPLE: Can user access Planche skill?
 * const canAccess = await canAccessSkill('planche', 'intermediate', completedExerciseIds);
 *
 * Planche requires:
 * - User level: intermediate or higher
 * - Completed: Pseudo Planche Push-ups AND Handstand Frog Stand
 *
 * Returns true only if user meets ALL requirements
 * Use this to lock/unlock skills in your UI!
 */
export async function canAccessSkill(
  skillId: string,
  userLevel: "beginner" | "intermediate" | "advanced",
  completedExerciseIds: string[]
): Promise<boolean> {
  try {
    const skill = await getSkill(skillId);

    if (!skill) return false;

    // Check minimum level requirement
    if (skill.unlockCriteria?.minLevel) {
      const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      const userLevelOrder = levelOrder[userLevel];
      const requiredLevelOrder = levelOrder[skill.unlockCriteria.minLevel];

      if (userLevelOrder < requiredLevelOrder) {
        return false;
      }
    }

    // Check required completed exercises
    if (skill.unlockCriteria?.completedExerciseIds) {
      const hasCompletedAll = skill.unlockCriteria.completedExerciseIds.every(
        (reqId) => completedExerciseIds.includes(reqId)
      );

      if (!hasCompletedAll) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking skill access:", error);
    return false;
  }
}

/**
 * Get current exercise in skill progression for user
 *
 * EXAMPLE: What exercise should user do next for Handstand?
 * const currentExercise = await getCurrentSkillExercise('handstand', completedExerciseIds);
 *
 * If user completed: Wall Plank, Wall Walk
 * Returns: "Chest-to-Wall Handstand" (the next one they haven't done)
 *
 * If user completed ALL exercises:
 * Returns: "Handstand Hold 60s" (the final/mastery exercise)
 *
 * Perfect for "Continue Training" buttons!
 */
export async function getCurrentSkillExercise(
  skillId: string,
  completedExerciseIds: string[]
): Promise<Exercise | null> {
  try {
    const skillData = await getSkillWithExercises(skillId);

    if (!skillData) return null;

    const { skill, exercises } = skillData;

    // Find the first incomplete exercise
    for (const progression of skill.progression) {
      if (!completedExerciseIds.includes(progression.exerciseId)) {
        return exercises.find((ex) => ex.id === progression.exerciseId) || null;
      }
    }

    // All exercises completed - return last one (mastery level)
    const lastProgression = skill.progression[skill.progression.length - 1];
    return exercises.find((ex) => ex.id === lastProgression.exerciseId) || null;
  } catch (error) {
    console.error("Error getting current skill exercise:", error);
    throw error;
  }
}

/**
 * Calculate skill progress percentage
 *
 * EXAMPLE: Show progress bar for Handstand skill
 * const progress = await getSkillProgress('handstand', completedExerciseIds);
 *
 * If user completed 3 out of 7 exercises:
 * Returns: 43 (percent)
 *
 * Use this for:
 * - Progress bars
 * - "You're 43% of the way to mastering Handstand!"
 * - Gamification elements
 */
export async function getSkillProgress(
  skillId: string,
  completedExerciseIds: string[]
): Promise<number> {
  try {
    const skill = await getSkill(skillId);

    if (!skill) return 0;

    const totalExercises = skill.progression.length;
    const completedCount = skill.progression.filter((p) =>
      completedExerciseIds.includes(p.exerciseId)
    ).length;

    return Math.round((completedCount / totalExercises) * 100);
  } catch (error) {
    console.error("Error calculating skill progress:", error);
    return 0;
  }
}
