// hooks/useBackend.ts
/**
 * React hooks for easy backend integration
 */

import { useState, useEffect } from "react";
import { FIREBASE_AUTH } from "../config/firebase";
import * as backend from "../backend";
import { User } from "../types/User";
import { Exercise } from "../types/Exercise";
import { Skill } from "../types/Skill";
import { Plan } from "../types/Plan";
import { Progress } from "../types/Progress";

/**
 * Hook to get current user data
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = FIREBASE_AUTH.currentUser;
        if (!currentUser) {
          setUser(null);
          return;
        }

        const userData = await backend.getUser(currentUser.uid);
        setUser(userData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading, error, refetch: () => setLoading(true) };
}

/**
 * Hook to get all skills
 */
export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await backend.getAllSkills();
        setSkills(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  return { skills, loading, error };
}

/**
 * Hook to get all strength paths
 */
export function useStrengthPaths() {
  const [paths, setPaths] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPaths = async () => {
      try {
        const data = await backend.getAllStrengthPaths();
        setPaths(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPaths();
  }, []);

  return { paths, loading, error };
}

/**
 * Hook to get user's progress
 */
export function useUserProgress(userId?: string) {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const uid = userId || FIREBASE_AUTH.currentUser?.uid;
        if (!uid) return;

        const data = await backend.getAllUserProgress(uid);
        setProgress(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  return { progress, loading, error };
}

/**
 * Hook to get user's workout plans
 */
export function useUserPlans(userId?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const uid = userId || FIREBASE_AUTH.currentUser?.uid;
        if (!uid) return;

        const data = await backend.getUserPlans(uid);
        setPlans(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [userId]);

  const refetch = () => setLoading(true);

  return { plans, loading, error, refetch };
}

/**
 * Hook to get today's workout plan
 */
export function useTodaysPlan(userId?: string) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTodaysPlan = async () => {
      try {
        const uid = userId || FIREBASE_AUTH.currentUser?.uid;
        if (!uid) return;

        const data = await backend.getTodaysPlan(uid);
        setPlan(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysPlan();
  }, [userId]);

  return { plan, loading, error };
}

/**
 * Hook to get skill with exercises
 */
export function useSkillWithExercises(skillId?: string) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSkill = async () => {
      try {
        if (!skillId) return;

        const data = await backend.getSkillWithExercises(skillId);
        if (data) {
          setSkill(data.skill);
          setExercises(data.exercises);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadSkill();
  }, [skillId]);

  return { skill, exercises, loading, error };
}

/**
 * Hook to get strength path with exercises
 */
export function useStrengthPathWithExercises(pathId?: string) {
  const [path, setPath] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPath = async () => {
      try {
        if (!pathId) return;

        const data = await backend.getStrengthPathWithExercises(pathId);
        if (data) {
          setPath(data.path);
          setExercises(data.exercises);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPath();
  }, [pathId]);

  return { path, exercises, loading, error };
}

/**
 * Hook to get exercises by category
 */
export function useExercisesByCategory(category?: Exercise["category"]) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        if (!category) return;

        const data = await backend.getExercisesByCategory(category);
        setExercises(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [category]);

  return { exercises, loading, error };
}
