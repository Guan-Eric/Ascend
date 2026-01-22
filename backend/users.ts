// backend/user.ts - Updated with auto-progression
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { User } from "../types/User";

/**
 * Initialize a new user in Firestore
 */
export async function initializeUser(
  userId: string,
  userData: {
    email: string;
    goalType: "skill" | "strength";
    primaryGoalId: string;
    level: "beginner" | "intermediate" | "advanced";
    trainingDaysPerWeek: number;
  }
): Promise<void> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);

    const user: User = {
      id: userId,
      email: userData.email,
      createdAt: Date.now(),
      goalType: userData.goalType,
      primaryGoalId: userData.primaryGoalId,
      level: userData.level,
      trainingDaysPerWeek: userData.trainingDaysPerWeek,
      autoProgressExercises: true, // Default to true for better UX
    };

    await setDoc(userRef, user);
    console.log("✅ User initialized:", userId);
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }

    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);
    await updateDoc(userRef, updates);
    console.log("✅ User updated:", userId);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Update user's goal
 */
export async function updateUserGoal(
  userId: string,
  goalType: "skill" | "strength",
  primaryGoalId: string
): Promise<void> {
  try {
    await updateUser(userId, {
      goalType,
      primaryGoalId,
    });
    console.log("✅ User goal updated");
  } catch (error) {
    console.error("Error updating user goal:", error);
    throw error;
  }
}