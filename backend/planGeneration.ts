/**
 * Auto-generate workout plans from onboarding profile data.
 */

import { Exercise } from "../types/Exercise";
import { User } from "../types/User";
import { getCompletedExerciseIds } from "./progress";
import {
  getSkillWithExercises,
  getStrengthPathWithExercises,
  getCurrentSkillExercise,
} from "./skills";
import { createPlan, getUserPlans } from "./plans";
import { getUser, updateUser } from "./users";

/** Mon=1 … Sun=7 — matches getTodaysPlan() in plans.ts */
const TRAINING_DAY_INDICES: Record<number, number[]> = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [1, 2, 3, 4, 5, 6, 7],
};

const EXERCISES_PER_DAY = 3;
const DEFAULT_SETS = 3;

function getTrainingDayIndices(trainingDaysPerWeek: number): number[] {
  const days = Math.min(7, Math.max(1, trainingDaysPerWeek));
  return TRAINING_DAY_INDICES[days] ?? TRAINING_DAY_INDICES[3];
}

/** JS getDay() Sunday=0 → Mon=1 … Sun=7 */
export function getTodayDayIndex(): number {
  const today = new Date().getDay();
  return today === 0 ? 7 : today;
}

function getLevelStartIndex(
  level: User["level"],
  totalExercises: number
): number {
  if (totalExercises <= EXERCISES_PER_DAY) return 0;

  const offsets = { beginner: 0, intermediate: 1, advanced: 2 };
  return Math.min(offsets[level], totalExercises - EXERCISES_PER_DAY);
}

function toPlanExercise(exercise: Exercise) {
  return {
    exerciseId: exercise.id,
    sets: DEFAULT_SETS,
    target: exercise.target,
  };
}

async function resolveGoalExercises(user: User): Promise<Exercise[]> {
  if (user.goalType === "skill") {
    const skillData = await getSkillWithExercises(user.primaryGoalId);
    if (!skillData) return [];

    const completedIds = await getCompletedExerciseIds(user.id);
    const current = await getCurrentSkillExercise(
      user.primaryGoalId,
      completedIds
    );
    if (!current) return [];

    const currentIndex = skillData.exercises.findIndex(
      (ex) => ex.id === current.id
    );
    const start = Math.max(0, currentIndex);
    return skillData.exercises.slice(start, start + 4);
  }

  const pathData = await getStrengthPathWithExercises(user.primaryGoalId);
  if (!pathData) return [];

  const start = getLevelStartIndex(user.level, pathData.exercises.length);
  return pathData.exercises.slice(start, start + 4);
}

function buildDayExercises(
  starterExercises: Exercise[],
  dayOffset: number
): Exercise[] {
  if (starterExercises.length === 0) return [];

  const result: Exercise[] = [];
  for (let i = 0; i < EXERCISES_PER_DAY; i++) {
    const exercise =
      starterExercises[(dayOffset + i) % starterExercises.length];
    if (!result.some((ex) => ex.id === exercise.id)) {
      result.push(exercise);
    }
  }

  while (
    result.length < EXERCISES_PER_DAY &&
    result.length < starterExercises.length
  ) {
    const next = starterExercises.find(
      (ex) => !result.some((r) => r.id === ex.id)
    );
    if (!next) break;
    result.push(next);
  }

  return result;
}

/**
 * Create a single free Day-1 sample plan after onboarding (before paywall).
 * Idempotent — returns existing samplePlanId if already set.
 */
export async function generateSamplePlan(userId: string): Promise<string> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.samplePlanId) {
    return user.samplePlanId;
  }

  const existingPlans = await getUserPlans(userId);
  if (existingPlans.length > 0) {
    const planId = existingPlans[0].id;
    await updateUser(userId, { samplePlanId: planId });
    return planId;
  }

  const starterExercises = await resolveGoalExercises(user);
  if (starterExercises.length === 0) {
    throw new Error("Could not resolve exercises for user goal");
  }

  const dayIndex = getTodayDayIndex();
  const dayExercises = buildDayExercises(starterExercises, 0);
  const planId = await createPlan({
    userId,
    goalId: user.primaryGoalId,
    dayIndex,
    exercises: dayExercises.map(toPlanExercise),
    completed: false,
    createdAt: Date.now(),
  });

  await updateUser(userId, { samplePlanId: planId });
  return planId;
}

/**
 * Create the remaining weekly plans after purchase.
 * Idempotent — skips if initialPlansGenerated is set.
 * If a sample plan already exists, creates plans for the other training days only.
 */
export async function generateInitialPlans(userId: string): Promise<string[]> {
  const user = await getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.initialPlansGenerated) {
    return [];
  }

  const existingPlans = await getUserPlans(userId);
  const existingDayIndices = new Set(existingPlans.map((p) => p.dayIndex));

  const starterExercises = await resolveGoalExercises(user);
  if (starterExercises.length === 0) {
    throw new Error("Could not resolve exercises for user goal");
  }

  const dayIndices = getTrainingDayIndices(user.trainingDaysPerWeek);
  const planIds: string[] = [];

  for (let i = 0; i < dayIndices.length; i++) {
    const dayIndex = dayIndices[i];
    if (existingDayIndices.has(dayIndex)) {
      continue;
    }

    const dayExercises = buildDayExercises(starterExercises, i);
    const planId = await createPlan({
      userId,
      goalId: user.primaryGoalId,
      dayIndex,
      exercises: dayExercises.map(toPlanExercise),
      completed: false,
      createdAt: Date.now(),
    });
    planIds.push(planId);
  }

  await updateUser(userId, { initialPlansGenerated: true });
  return planIds;
}
