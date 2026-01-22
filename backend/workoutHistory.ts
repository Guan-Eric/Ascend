// backend/workoutHistory.ts - Updated with weekly streaks
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
 * Get workout history stats with WEEKLY streaks
 */
export async function getWorkoutHistoryStats(userId: string): Promise<{
  totalWorkouts: number;
  totalExercises: number;
  weeklyStreak: number;
  longestWeeklyStreak: number;
}> {
  try {
    const history = await getUserWorkoutHistory(userId);

    const totalWorkouts = history.length;
    const totalExercises = history.reduce(
      (sum, workout) => sum + workout.exercises.length,
      0
    );

    // Get unique workout weeks (year-week format)
    const getWeekKey = (timestamp: number) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      // Get week number (ISO week)
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      return `${year}-W${weekNumber}`;
    };

    const workoutWeeks = [...new Set(
      history.map(h => getWeekKey(h.completedAt))
    )].sort().reverse(); // Sort most recent first

    // Calculate current weekly streak
    let weeklyStreak = 0;
    const currentWeek = getWeekKey(Date.now());
    
    // Get previous week
    const getPreviousWeek = (weekKey: string) => {
      const [year, week] = weekKey.split('-W').map(Number);
      if (week === 1) {
        return `${year - 1}-W52`;
      }
      return `${year}-W${week - 1}`;
    };

    if (workoutWeeks.includes(currentWeek)) {
      weeklyStreak = 1;
      let checkWeek = getPreviousWeek(currentWeek);
      
      while (workoutWeeks.includes(checkWeek)) {
        weeklyStreak++;
        checkWeek = getPreviousWeek(checkWeek);
      }
    }

    // Calculate longest weekly streak
    let longestWeeklyStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < workoutWeeks.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const expectedPrevWeek = getPreviousWeek(workoutWeeks[i - 1]);
        
        if (workoutWeeks[i] === expectedPrevWeek) {
          tempStreak++;
        } else {
          longestWeeklyStreak = Math.max(longestWeeklyStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestWeeklyStreak = Math.max(longestWeeklyStreak, tempStreak);

    return {
      totalWorkouts,
      totalExercises,
      weeklyStreak,
      longestWeeklyStreak,
    };
  } catch (error) {
    console.error("Error getting workout history stats:", error);
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      weeklyStreak: 0,
      longestWeeklyStreak: 0,
    };
  }
}