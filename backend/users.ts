// backend/users.ts
/**
 * User management functions for Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { User } from "../types/User";

/**
 * Create a new user profile in Firestore
 */
export async function createUser(
  userId: string,
  userData: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);

    const newUser: Omit<User, "id"> = {
      email: userData.email || "",
      goalType: userData.goalType || "strength",
      primaryGoalId: userData.primaryGoalId || "push_strength",
      level: userData.level || "beginner",
      trainingDaysPerWeek: userData.trainingDaysPerWeek || 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(userRef, newUser);
    console.log("✅ User created successfully:", userId);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }

    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  try {
    const userRef = doc(FIRESTORE_DB, "users", userId);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });

    console.log("✅ User updated successfully:", userId);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Update user's primary goal
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

    console.log("✅ User goal updated:", { goalType, primaryGoalId });
  } catch (error) {
    console.error("Error updating user goal:", error);
    throw error;
  }
}

/**
 * Update user's training frequency
 */
export async function updateTrainingFrequency(
  userId: string,
  daysPerWeek: number
): Promise<void> {
  try {
    await updateUser(userId, {
      trainingDaysPerWeek: daysPerWeek,
    });

    console.log("✅ Training frequency updated:", daysPerWeek);
  } catch (error) {
    console.error("Error updating training frequency:", error);
    throw error;
  }
}

/**
 * Update user's experience level
 */
export async function updateUserLevel(
  userId: string,
  level: "beginner" | "intermediate" | "advanced"
): Promise<void> {
  try {
    await updateUser(userId, { level });

    console.log("✅ User level updated:", level);
  } catch (error) {
    console.error("Error updating user level:", error);
    throw error;
  }
}

/**
 * Check if user exists
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await getUser(userId);
    return user !== null;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
}

/**
 * Initialize user on first sign-in
 * Creates user document if it doesn't exist
 */
export async function initializeUser(
  userId: string,
  initialData?: Partial<User>
): Promise<User> {
  try {
    const existingUser = await getUser(userId);

    if (existingUser) {
      return existingUser;
    }

    // Create new user with defaults
    await createUser(userId, initialData || {});

    const newUser = await getUser(userId);
    if (!newUser) {
      throw new Error("Failed to create user");
    }

    return newUser;
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
}
