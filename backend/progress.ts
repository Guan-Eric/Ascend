// backend/progress.ts
/**
 * User progress tracking functions
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { Progress } from "../types/Progress";

/**
 * Get user's progress for a specific exercise
 */
export async function getExerciseProgress(
  userId: string,
  exerciseId: string
): Promise<Progress | null> {
  try {
    const docRef = doc(FIRESTORE_DB, "progress", `${userId}_${exerciseId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Progress;
    }
    return null;
  } catch (error) {
    console.error("Error getting exercise progress:", error);
    throw error;
  }
}

/**
 * Get all progress for a user
 */
export async function getAllUserProgress(userId: string): Promise<Progress[]> {
  try {
    const progressRef = collection(FIRESTORE_DB, "progress");
    const q = query(
      progressRef,
      where("userId", "==", userId),
      orderBy("lastCompletedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Progress);
  } catch (error) {
    console.error("Error getting all user progress:", error);
    throw error;
  }
}

/**
 * Update or create progress for an exercise
 */
export async function updateExerciseProgress(
  userId: string,
  exerciseId: string,
  value: number
): Promise<void> {
  try {
    const docRef = doc(FIRESTORE_DB, "progress", `${userId}_${exerciseId}`);
    const existingProgress = await getDoc(docRef);

    const progressData: Progress = {
      userId,
      exerciseId,
      bestValue: value,
      lastCompletedAt: Date.now(),
    };

    // If exists, only update if new value is better
    if (existingProgress.exists()) {
      const existing = existingProgress.data() as Progress;
      progressData.bestValue = Math.max(existing.bestValue, value);
    }

    await setDoc(docRef, progressData, { merge: true });
    console.log("✅ Progress updated:", { exerciseId, value });
  } catch (error) {
    console.error("Error updating exercise progress:", error);
    throw error;
  }
}

/**
 * Mark exercise as completed
 */
export async function markExerciseCompleted(
  userId: string,
  exerciseId: string,
  value: number
): Promise<void> {
  try {
    await updateExerciseProgress(userId, exerciseId, value);
  } catch (error) {
    console.error("Error marking exercise completed:", error);
    throw error;
  }
}

/**
 * Get list of completed exercise IDs for a user
 */
export async function getCompletedExerciseIds(
  userId: string
): Promise<string[]> {
  try {
    const allProgress = await getAllUserProgress(userId);
    return allProgress.map((p) => p.exerciseId);
  } catch (error) {
    console.error("Error getting completed exercise IDs:", error);
    throw error;
  }
}

/**
 * Check if user has completed an exercise
 */
export async function hasCompletedExercise(
  userId: string,
  exerciseId: string
): Promise<boolean> {
  try {
    const progress = await getExerciseProgress(userId, exerciseId);
    return progress !== null;
  } catch (error) {
    console.error("Error checking if exercise completed:", error);
    return false;
  }
}

/**
 * Get user's recent activity (last N exercises)
 */
export async function getRecentActivity(
  userId: string,
  limitCount: number = 10
): Promise<Progress[]> {
  try {
    const progressRef = collection(FIRESTORE_DB, "progress");
    const q = query(
      progressRef,
      where("userId", "==", userId),
      orderBy("lastCompletedAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Progress);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    throw error;
  }
}

/**
 * Get personal best for an exercise
 */
export async function getPersonalBest(
  userId: string,
  exerciseId: string
): Promise<number | null> {
  try {
    const progress = await getExerciseProgress(userId, exerciseId);
    return progress?.bestValue || null;
  } catch (error) {
    console.error("Error getting personal best:", error);
    return null;
  }
}

/**
 * Calculate total completed exercises for user
 */
export async function getTotalCompletedExercises(
  userId: string
): Promise<number> {
  try {
    const completedIds = await getCompletedExerciseIds(userId);
    return completedIds.length;
  } catch (error) {
    console.error("Error getting total completed exercises:", error);
    return 0;
  }
}

/**
 * Get progress stats for user
 */
export async function getUserProgressStats(userId: string): Promise<{
  totalExercisesCompleted: number;
  recentActivity: Progress[];
  bestPerformances: Progress[];
}> {
  try {
    const allProgress = await getAllUserProgress(userId);

    // Sort by best value to get top performances
    const bestPerformances = [...allProgress]
      .sort((a, b) => b.bestValue - a.bestValue)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = allProgress.slice(0, 10);

    return {
      totalExercisesCompleted: allProgress.length,
      recentActivity,
      bestPerformances,
    };
  } catch (error) {
    console.error("Error getting user progress stats:", error);
    throw error;
  }
}
