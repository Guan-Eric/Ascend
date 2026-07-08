// utils/analytics.ts
// Lightweight event logging using the GA4 Measurement Protocol over fetch.
//
// Why not firebase/analytics or @react-native-firebase/analytics:
// - firebase/analytics (JS SDK) relies on browser APIs that don't exist in
//   React Native, so it silently no-ops on device.
// - @react-native-firebase/analytics is a native module; this project
//   deliberately moved off @react-native-firebase already, so adding it back
//   just for analytics would reintroduce the same build complexity.
// This module talks directly to Google Analytics 4's Measurement Protocol,
// which is a plain HTTPS endpoint — no native code, works in Expo Go and
// dev builds alike.
//
// Setup required:
// 1. In GA4 (linked to your Firebase project): Admin > Data Streams > your
//    stream > Measurement Protocol API secrets > Create.
// 2. Add MEASUREMENT_API_SECRET=<that value> to your .env file.
// 3. MEASUREMENT_ID is already configured (see config/firebase.js).

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const CLIENT_ID_KEY = '@ascend_analytics_client_id';
const SESSION_ID_KEY = '@ascend_analytics_session_id';

const MEASUREMENT_ID = Constants.expoConfig?.extra?.measurementId;
const API_SECRET = Constants.expoConfig?.extra?.measurementApiSecret;

let cachedClientId: string | null = null;
let cachedSessionId: string | null = null;

// A stable per-install ID. Not tied to Firebase auth uid on purpose —
// anonymous Firebase users can churn/reset, this shouldn't.
async function getClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;
  let id = await AsyncStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
    await AsyncStorage.setItem(CLIENT_ID_KEY, id);
  }
  cachedClientId = id;
  return id;
}

// GA4 groups events into sessions. Good enough for D1/D7/D30 retention
// reporting: one session id per app cold start.
async function getSessionId(): Promise<string> {
  if (cachedSessionId) return cachedSessionId;
  let id = await AsyncStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `${Date.now()}`;
    await AsyncStorage.setItem(SESSION_ID_KEY, id);
  }
  cachedSessionId = id;
  return id;
}

/**
 * Fire-and-forget event log. Never throws — analytics should never be able
 * to break the app or block a user-facing action.
 */
export async function logEvent(
  name: string,
  params: Record<string, string | number | boolean> = {}
): Promise<void> {
  try {
    if (!MEASUREMENT_ID || !API_SECRET) {
      if (__DEV__) {
        console.warn(
          `[analytics] Skipped "${name}" — MEASUREMENT_ID or MEASUREMENT_API_SECRET not set`
        );
      }
      return;
    }

    const clientId = await getClientId();
    const sessionId = await getSessionId();

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [
          {
            name,
            params: {
              session_id: sessionId,
              engagement_time_msec: 1,
              ...params,
            },
          },
        ],
      }),
    });
  } catch (error) {
    if (__DEV__) console.warn('[analytics] logEvent failed:', error);
  }
}

// --- Funnel-specific helpers -----------------------------------------

/** Call once per cold start. */
export function logAppOpen() {
  return logEvent('app_open');
}

/** Call right after a workout is successfully saved to history. */
export function logWorkoutCompleted(params: { exerciseCount: number; goalType?: string }) {
  return logEvent('workout_completed', {
    exercise_count: params.exerciseCount,
    goal_type: params.goalType ?? 'unknown',
  });
}

/** Call when the paywall screen mounts / offerings finish loading. */
export function logPaywallViewed(params: { source?: string } = {}) {
  return logEvent('paywall_viewed', { source: params.source ?? 'onboarding' });
}

/** Call on a successful purchase, before or as the trial begins. */
export function logTrialStarted(params: { packageId: string }) {
  return logEvent('trial_started', { package_id: params.packageId });
}

/** Call on a successful purchase that is not a trial (rare path, e.g. restored). */
export function logSubscriptionStarted(params: { packageId: string }) {
  return logEvent('subscription_started', { package_id: params.packageId });
}

/** Call when a purchase attempt fails (not counting user cancellation). */
export function logPurchaseFailed(params: { packageId: string; reason?: string }) {
  return logEvent('purchase_failed', {
    package_id: params.packageId,
    reason: params.reason ?? 'unknown',
  });
}
