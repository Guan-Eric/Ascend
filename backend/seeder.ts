// backend/seeder.ts
/**
 * Database seeding functions for populating Firestore
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebase";
import { exercises } from "../data/exercises";
import { skills, strengthPaths } from "../data/skills";

/**
 * Seed all exercises into Firestore
 */
export async function seedExercises(): Promise<void> {
  console.log("🏋️ Starting to seed exercises...");

  const exerciseIds = Object.keys(exercises);
  const batchSize = 500; // Firestore batch limit
  let processedCount = 0;

  // Process in batches
  for (let i = 0; i < exerciseIds.length; i += batchSize) {
    const batch = writeBatch(FIRESTORE_DB);
    const batchIds = exerciseIds.slice(i, i + batchSize);

    for (const exerciseId of batchIds) {
      const exercise = exercises[exerciseId];
      const docRef = doc(FIRESTORE_DB, "exercises", exerciseId);
      batch.set(docRef, exercise);
      processedCount++;
    }

    await batch.commit();
    console.log(
      `✅ Processed ${processedCount}/${exerciseIds.length} exercises`
    );
  }

  console.log("✨ All exercises seeded successfully!");
}

/**
 * Seed all skills into Firestore
 */
export async function seedSkills(): Promise<void> {
  console.log("🎯 Starting to seed skills...");

  const skillIds = Object.keys(skills);
  let processedCount = 0;

  for (const skillId of skillIds) {
    const skill = skills[skillId];
    const docRef = doc(FIRESTORE_DB, "skills", skillId);
    await setDoc(docRef, skill);
    processedCount++;
    console.log(
      `✅ Seeded skill: ${skill.name} (${processedCount}/${skillIds.length})`
    );
  }

  console.log("✨ All skills seeded successfully!");
}

/**
 * Seed all strength paths into Firestore
 */
export async function seedStrengthPaths(): Promise<void> {
  console.log("💪 Starting to seed strength paths...");

  const pathIds = Object.keys(strengthPaths);
  let processedCount = 0;

  for (const pathId of pathIds) {
    const path = strengthPaths[pathId];
    const docRef = doc(FIRESTORE_DB, "strengthPaths", pathId);
    await setDoc(docRef, path);
    processedCount++;
    console.log(
      `✅ Seeded path: ${path.name} (${processedCount}/${pathIds.length})`
    );
  }

  console.log("✨ All strength paths seeded successfully!");
}

/**
 * Main seeding function - runs all seeds
 */
export async function seedAll(): Promise<void> {
  try {
    console.log("🚀 Starting Firestore seeding process...\n");

    await seedExercises();
    console.log("");

    await seedSkills();
    console.log("");

    await seedStrengthPaths();
    console.log("");

    console.log("🎉 DATABASE SEEDING COMPLETE!");
    console.log("📊 Summary:");
    console.log(`   - Exercises: ${Object.keys(exercises).length}`);
    console.log(`   - Skills: ${Object.keys(skills).length}`);
    console.log(`   - Strength Paths: ${Object.keys(strengthPaths).length}`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

/**
 * Check if database has been seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const exerciseRef = doc(FIRESTORE_DB, "exercises", "push_standard");
    const exerciseSnap = await getDoc(exerciseRef);

    return exerciseSnap.exists();
  } catch (error) {
    console.error("Error checking if database is seeded:", error);
    return false;
  }
}
