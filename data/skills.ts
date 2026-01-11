// data/skills.ts
import { Skill } from "../types/Skill";

export const skills: Record<string, Skill> = {
  handstand: {
    id: "handstand",
    name: "Handstand",
    description: "Master the art of balancing upside down on your hands",
    progression: [
      { exerciseId: "handstand_wall_plank", order: 1 },
      { exerciseId: "handstand_wall_walk", order: 2 },
      { exerciseId: "handstand_chest_to_wall", order: 3 },
      { exerciseId: "handstand_wall_shoulder_taps", order: 4 },
      { exerciseId: "handstand_frog_stand", order: 5 },
      { exerciseId: "handstand_freestanding", order: 6 },
      { exerciseId: "handstand_hold_60s", order: 7 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
    },
    createdAt: Date.now(),
  },

  front_lever: {
    id: "front_lever",
    name: "Front Lever",
    description: "Hold your body horizontally while hanging from a bar",
    progression: [
      { exerciseId: "front_lever_scapular_hang", order: 1 },
      { exerciseId: "front_lever_tuck", order: 2 },
      { exerciseId: "front_lever_advanced_tuck", order: 3 },
      { exerciseId: "front_lever_one_leg", order: 4 },
      { exerciseId: "front_lever_straddle", order: 5 },
      { exerciseId: "front_lever_full", order: 6 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
      completedExerciseIds: ["pull_strict"],
    },
    createdAt: Date.now(),
  },

  muscle_up: {
    id: "muscle_up",
    name: "Muscle-Up",
    description:
      "Explosive movement from hanging to support position above the bar",
    progression: [
      { exerciseId: "muscle_up_false_grip_hang", order: 1 },
      { exerciseId: "muscle_up_chest_to_bar", order: 2 },
      { exerciseId: "muscle_up_straight_bar_dips", order: 3 },
      { exerciseId: "muscle_up_jumping", order: 4 },
      { exerciseId: "muscle_up_negative", order: 5 },
      { exerciseId: "muscle_up_strict", order: 6 },
    ],
    unlockCriteria: {
      minLevel: "intermediate",
      completedExerciseIds: ["pull_chest_to_bar", "push_diamond"],
    },
    createdAt: Date.now(),
  },

  l_sit: {
    id: "l_sit",
    name: "L-Sit",
    description:
      "Hold your legs straight out while supporting your body on your hands",
    progression: [
      { exerciseId: "l_sit_tuck", order: 1 },
      { exerciseId: "l_sit_one_leg", order: 2 },
      { exerciseId: "l_sit_full", order: 3 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
      completedExerciseIds: ["core_plank"],
    },
    createdAt: Date.now(),
  },

  planche: {
    id: "planche",
    name: "Planche",
    description:
      "Hold your body horizontally while balanced only on your hands",
    progression: [
      { exerciseId: "planche_lean", order: 1 },
      { exerciseId: "planche_frog_stand", order: 2 },
      { exerciseId: "planche_tuck", order: 3 },
      { exerciseId: "planche_advanced_tuck", order: 4 },
      { exerciseId: "planche_straddle", order: 5 },
      { exerciseId: "planche_full", order: 6 },
    ],
    unlockCriteria: {
      minLevel: "intermediate",
      completedExerciseIds: ["push_pseudo_planche", "handstand_frog_stand"],
    },
    createdAt: Date.now(),
  },
};

export const strengthPaths: Record<string, Skill> = {
  push_strength: {
    id: "push_strength",
    name: "Push Strength",
    description: "Build powerful pushing strength through progressive overload",
    progression: [
      { exerciseId: "push_wall", order: 1 },
      { exerciseId: "push_knee", order: 2 },
      { exerciseId: "push_standard", order: 3 },
      { exerciseId: "push_diamond", order: 4 },
      { exerciseId: "push_decline", order: 5 },
      { exerciseId: "push_pseudo_planche", order: 6 },
      { exerciseId: "push_archer", order: 7 },
      { exerciseId: "push_one_arm", order: 8 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
    },
    createdAt: Date.now(),
  },

  pull_strength: {
    id: "pull_strength",
    name: "Pull Strength",
    description: "Develop incredible pulling power and back strength",
    progression: [
      { exerciseId: "pull_dead_hang", order: 1 },
      { exerciseId: "pull_australian_rows", order: 2 },
      { exerciseId: "pull_negative", order: 3 },
      { exerciseId: "pull_band_assisted", order: 4 },
      { exerciseId: "pull_strict", order: 5 },
      { exerciseId: "pull_chest_to_bar", order: 6 },
      { exerciseId: "pull_archer", order: 7 },
      { exerciseId: "pull_weighted", order: 8 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
    },
    createdAt: Date.now(),
  },

  leg_strength: {
    id: "leg_strength",
    name: "Leg Strength",
    description: "Build powerful legs with single-leg strength exercises",
    progression: [
      { exerciseId: "legs_assisted_squat", order: 1 },
      { exerciseId: "legs_bodyweight_squat", order: 2 },
      { exerciseId: "legs_split_squat", order: 3 },
      { exerciseId: "legs_bulgarian", order: 4 },
      { exerciseId: "legs_assisted_pistol", order: 5 },
      { exerciseId: "legs_pistol", order: 6 },
      { exerciseId: "legs_shrimp", order: 7 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
    },
    createdAt: Date.now(),
  },

  core_strength: {
    id: "core_strength",
    name: "Core Strength",
    description: "Develop rock-solid core stability and strength",
    progression: [
      { exerciseId: "core_dead_bugs", order: 1 },
      { exerciseId: "core_plank", order: 2 },
      { exerciseId: "core_side_plank", order: 3 },
      { exerciseId: "core_hanging_knee_raises", order: 4 },
      { exerciseId: "core_hanging_leg_raises", order: 5 },
      { exerciseId: "core_toes_to_bar", order: 6 },
      { exerciseId: "core_windshield_wipers", order: 7 },
    ],
    unlockCriteria: {
      minLevel: "beginner",
    },
    createdAt: Date.now(),
  },
};
