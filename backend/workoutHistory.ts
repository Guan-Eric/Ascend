// backend/workoutHistory.ts
/**
 * Workout history tracking functions
 */

import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    limit,
  } from "firebase/firestore";
  import { FIRESTORE_DB } from "../config/firebase";
  import { WorkoutHistory } from "../types/WorkoutHistory";
  
  /**
   * Save completed workout to history
   */
  export async function saveWorkoutHistory(
    historyData: Omit<WorkoutHistory, "id">
  ): Promise<string> {
    try {
      const historyRef = collection(FIRESTORE_DB, "workoutHistory");
      const newHistoryRef = doc(historyRef);
  
      const history: WorkoutHistory = {
        id: newHistoryRef.id,
        ...historyData,
      };
  
      await setDoc(newHistoryRef, history);
      console.log("✅ Workout history saved:", newHistoryRef.id);
  
      return newHistoryRef.id;
    } catch (error) {
      console.error("Error saving workout history:", error);
      throw error;
    }
  }
  
  /**
   * Get all workout history for a user
   */
  export async function getUserWorkoutHistory(
    userId: string
  ): Promise<WorkoutHistory[]> {
    try {
      const historyRef = collection(FIRESTORE_DB, "workoutHistory");
      const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("completedAt", "desc")
      );
  
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as WorkoutHistory);
    } catch (error) {
      console.error("Error getting workout history:", error);
      throw error;
    }
  }
  
  /**
   * Get recent workout history (last N workouts)
   */
  export async function getRecentWorkoutHistory(
    userId: string,
    limitCount: number = 10
  ): Promise<WorkoutHistory[]> {
    try {
      const historyRef = collection(FIRESTORE_DB, "workoutHistory");
      const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(limitCount)
      );
  
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as WorkoutHistory);
    } catch (error) {
      console.error("Error getting recent workout history:", error);
      throw error;
    }
  }
  
  /**
   * Get workout history stats
   */
  export async function getWorkoutHistoryStats(userId: string): Promise<{
    totalWorkouts: number;
    totalExercises: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    try {
      const history = await getUserWorkoutHistory(userId);
  
      const totalWorkouts = history.length;
      const totalExercises = history.reduce(
        (sum, workout) => sum + workout.exercises.length,
        0
      );
  
      // Calculate current streak (consecutive days)
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Get unique workout dates
      const workoutDates = [...new Set(
        history.map(h => {
          const d = new Date(h.completedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      )].sort((a, b) => b - a); // Sort descending
  
      // Check streak from today backwards
      for (let i = 0; i < workoutDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);
  
        if (workoutDates[i] === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
  
      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
  
      for (let i = 0; i < workoutDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(workoutDates[i - 1]);
          const currDate = new Date(workoutDates[i]);
          const daysDiff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );
  
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
  
      return {
        totalWorkouts,
        totalExercises,
        currentStreak,
        longestStreak,
      };
    } catch (error) {
      console.error("Error getting workout history stats:", error);
      return {
        totalWorkouts: 0,
        totalExercises: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  }