import { WorkoutPreset } from "../types/WorkoutPreset";

/**
 * Curated workout presets inspired by popular online calisthenics programs.
 * Exercise IDs map to the app's exercise library in data/exercises.ts.
 */
export const workoutPresets: WorkoutPreset[] = [
  {
    id: "reddit_rr_full_body",
    name: "Recommended Routine — Full Body",
    description:
      "The classic beginner full-body routine from r/bodyweightfitness. Three sets of push, pull, and leg work with core finisher.",
    source: {
      name: "r/bodyweightfitness",
      url: "https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/",
    },
    level: "beginner",
    focus: "full_body",
    durationMinutes: 45,
    exercises: [
      { exerciseId: "push_standard", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "pull_australian_rows", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "legs_bodyweight_squat", sets: 3, target: { type: "reps", value: 12 } },
      { exerciseId: "core_plank", sets: 3, target: { type: "time", value: 45 } },
      { exerciseId: "core_hanging_knee_raises", sets: 3, target: { type: "reps", value: 8 } },
    ],
  },
  {
    id: "reddit_rr_push",
    name: "Recommended Routine — Push Focus",
    description:
      "Push-dominant session based on the Reddit Recommended Routine progression. Great for building pressing strength.",
    source: {
      name: "r/bodyweightfitness",
      url: "https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/",
    },
    level: "beginner",
    focus: "push",
    durationMinutes: 35,
    exercises: [
      { exerciseId: "push_standard", sets: 3, target: { type: "reps", value: 10 } },
      { exerciseId: "push_diamond", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "push_decline", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "core_plank", sets: 3, target: { type: "time", value: 45 } },
      { exerciseId: "core_side_plank", sets: 2, target: { type: "time", value: 30 } },
    ],
  },
  {
    id: "reddit_rr_pull",
    name: "Recommended Routine — Pull Focus",
    description:
      "Pull-dominant session from the Reddit Recommended Routine. Builds back and bicep strength on the bar.",
    source: {
      name: "r/bodyweightfitness",
      url: "https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/",
    },
    level: "beginner",
    focus: "pull",
    durationMinutes: 35,
    exercises: [
      { exerciseId: "pull_dead_hang", sets: 3, target: { type: "time", value: 30 } },
      { exerciseId: "pull_australian_rows", sets: 3, target: { type: "reps", value: 10 } },
      { exerciseId: "pull_negative", sets: 3, target: { type: "reps", value: 5 } },
      { exerciseId: "core_hanging_knee_raises", sets: 3, target: { type: "reps", value: 10 } },
    ],
  },
  {
    id: "fitnessfaqs_beginner",
    name: "FitnessFAQs Beginner Split",
    description:
      "A balanced push/pull/legs session inspired by FitnessFAQs beginner programming. Solid foundation for calisthenics.",
    source: {
      name: "FitnessFAQs",
      url: "https://www.youtube.com/@FitnessFAQs",
    },
    level: "beginner",
    focus: "full_body",
    durationMinutes: 40,
    exercises: [
      { exerciseId: "push_knee", sets: 3, target: { type: "reps", value: 12 } },
      { exerciseId: "pull_australian_rows", sets: 3, target: { type: "reps", value: 10 } },
      { exerciseId: "legs_assisted_squat", sets: 3, target: { type: "reps", value: 12 } },
      { exerciseId: "core_dead_bugs", sets: 3, target: { type: "reps", value: 12 } },
      { exerciseId: "core_plank", sets: 3, target: { type: "time", value: 30 } },
    ],
  },
  {
    id: "calisthenic_movement_fundamentals",
    name: "Calisthenic Movement Fundamentals",
    description:
      "Foundational strength workout inspired by Calisthenic Movement's beginner approach. Focus on form and control.",
    source: {
      name: "Calisthenic Movement",
      url: "https://www.youtube.com/@Calisthenicmovement",
    },
    level: "beginner",
    focus: "full_body",
    durationMinutes: 35,
    exercises: [
      { exerciseId: "push_wall", sets: 3, target: { type: "reps", value: 15 } },
      { exerciseId: "pull_dead_hang", sets: 3, target: { type: "time", value: 20 } },
      { exerciseId: "legs_bodyweight_squat", sets: 3, target: { type: "reps", value: 15 } },
      { exerciseId: "core_dead_bugs", sets: 3, target: { type: "reps", value: 10 } },
    ],
  },
  {
    id: "intermediate_push_pull",
    name: "Intermediate Push & Pull",
    description:
      "A harder session for athletes ready to progress beyond basics. Inspired by intermediate Reddit RR progressions.",
    source: {
      name: "r/bodyweightfitness",
      url: "https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/",
    },
    level: "intermediate",
    focus: "upper",
    durationMinutes: 50,
    exercises: [
      { exerciseId: "push_diamond", sets: 4, target: { type: "reps", value: 10 } },
      { exerciseId: "push_pseudo_planche", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "pull_strict", sets: 4, target: { type: "reps", value: 6 } },
      { exerciseId: "pull_chest_to_bar", sets: 3, target: { type: "reps", value: 5 } },
      { exerciseId: "core_hanging_leg_raises", sets: 3, target: { type: "reps", value: 8 } },
    ],
  },
  {
    id: "legs_and_core",
    name: "Legs & Core Builder",
    description:
      "Lower body and core emphasis session. Useful as a standalone day or complement to upper body work.",
    source: {
      name: "FitnessFAQs",
      url: "https://www.youtube.com/@FitnessFAQs",
    },
    level: "intermediate",
    focus: "legs",
    durationMinutes: 40,
    exercises: [
      { exerciseId: "legs_split_squat", sets: 3, target: { type: "reps", value: 10 } },
      { exerciseId: "legs_bulgarian", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "legs_bodyweight_squat", sets: 3, target: { type: "reps", value: 15 } },
      { exerciseId: "core_side_plank", sets: 3, target: { type: "time", value: 30 } },
      { exerciseId: "core_hanging_knee_raises", sets: 3, target: { type: "reps", value: 12 } },
    ],
  },
  {
    id: "core_specialist",
    name: "Core Specialist",
    description:
      "Dedicated core session progressing from floor work to hanging variations. Inspired by gymnastics-style core training.",
    source: {
      name: "Gymnastics Bodies",
      url: "https://www.gymnasticbodies.com/",
    },
    level: "intermediate",
    focus: "core",
    durationMinutes: 30,
    exercises: [
      { exerciseId: "core_dead_bugs", sets: 3, target: { type: "reps", value: 15 } },
      { exerciseId: "core_plank", sets: 3, target: { type: "time", value: 60 } },
      { exerciseId: "core_side_plank", sets: 3, target: { type: "time", value: 45 } },
      { exerciseId: "core_hanging_knee_raises", sets: 3, target: { type: "reps", value: 12 } },
      { exerciseId: "core_hanging_leg_raises", sets: 3, target: { type: "reps", value: 8 } },
    ],
  },
  {
    id: "handstand_prep",
    name: "Handstand Prep Session",
    description:
      "Skill-focused session for building toward a freestanding handstand. Based on common online handstand progressions.",
    source: {
      name: "GMB Fitness",
      url: "https://gmb.io/handstand/",
    },
    level: "intermediate",
    focus: "skill",
    durationMinutes: 35,
    exercises: [
      { exerciseId: "handstand_wall_plank", sets: 3, target: { type: "time", value: 30 } },
      { exerciseId: "handstand_wall_walk", sets: 3, target: { type: "reps", value: 5 } },
      { exerciseId: "handstand_chest_to_wall", sets: 3, target: { type: "time", value: 30 } },
      { exerciseId: "handstand_wall_shoulder_taps", sets: 3, target: { type: "reps", value: 8 } },
      { exerciseId: "core_plank", sets: 2, target: { type: "time", value: 45 } },
    ],
  },
];
