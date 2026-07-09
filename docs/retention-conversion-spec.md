# Ascend Retention & Conversion Specification

**Version:** 1.0  
**Date:** July 8, 2026  
**Status:** Week 1 implementation in progress

---

## 1. Executive summary

Ascend uses a **hard paywall** after onboarding. Users pay before experiencing a workout, then land on an empty Home screen and must manually build plans. This spec defines the 30-day roadmap to fix activation, conversion, and retention — with RevenueCat subscription gaps and implementation status.

### North-star metrics

| Metric | Definition | Target (90 days) |
|--------|------------|------------------|
| **Trial → Paid** | Users who convert after 3-day trial | > 40% |
| **D1 activation** | Subscribers who complete Workout 1 within 24h | > 60% |
| **W1 retention** | Subscribers with ≥1 workout in week 1 | > 50% |
| **Paywall → Trial** | Paywall viewers who start trial | > 15% |

---

## 2. RevenueCat gap analysis

> **Note:** RevenueCat MCP requires authentication in Cursor (`plugin-revenuecat-RevenueCat` → run `mcp_auth`). Analysis below is from codebase audit + terminal purchase logs until MCP is connected.

### 2.1 Current RevenueCat setup

| Item | App value | Status |
|------|-----------|--------|
| Entitlement ID | `Ascend Pro` | ✅ Used in routing (`constants/revenuecat.ts`) |
| Weekly package | `$rc_weekly` | ✅ 3-day free trial badge in UI |
| Annual package | `$rc_annual` | ✅ Best-value badge with savings calc |
| Products | `ascend_weekly` (from logs) | ✅ Purchases completing in Sandbox |
| iOS API key | From `REVENUECAT_API_KEY` env | ✅ Configured |
| Android API key | `YOUR_ANDROID_API_KEY` placeholder | ❌ **Broken** |

### 2.2 RevenueCat gaps (product + dashboard)

| Gap | Impact | Priority | Action |
|-----|--------|----------|--------|
| **No value before paywall** | Low trial start rate | P0 | Week 2: A/B freemium or sample workout |
| **Generic paywall copy** | Weak conversion | P1 | ✅ **Done:** goal-personalized headline |
| **No trial-end reminders** | Silent churn at day 3 | P1 | Week 3: in-app banner + push |
| **No win-back offers** | Lapsed subs never return | P2 | RevenueCat Offerings for expired users |
| **No server-side webhooks** | Can't trigger emails/push on events | P1 | Set up RevenueCat → Firebase Function |
| **Entitlement mismatch** (`"pro"` vs `"Ascend Pro"`) | Profile sub status wrong | P0 | ✅ **Fixed** |
| **No subscription status in Profile UI** | Users can't see renewal date | P2 | Show `hasProAccess` + expiration |
| **Android not configured** | 0 Android revenue | P0 | Add Android API key in `_layout.tsx` |
| **No cohort analytics in RC** | Can't see trial conversion by goal | P1 | Tag customers with `goalType` attribute on purchase |

### 2.3 Recommended RevenueCat dashboard actions

1. **Customer attributes** — Set on purchase:
   - `goal_type`: `skill` | `strength`
   - `primary_goal_id`: e.g. `muscle_up`
   - `level`: `beginner` | `intermediate` | `advanced`
   - `training_days`: `1`–`7`

2. **Experiments** — Test paywall variants:
   - Control: current hard paywall
   - Variant A: 1 free workout before paywall
   - Variant B: Annual default vs weekly default

3. **Webhooks** — Subscribe to:
   - `INITIAL_PURCHASE` → mark user pro, trigger welcome email
   - `RENEWAL` → log retention event
   - `CANCELLATION` → trigger win-back flow
   - `EXPIRATION` → route to paywall with offer

4. **Offerings** — Create `winback` offering for lapsed subscribers (e.g. 50% off annual).

### 2.4 Sandbox validation (from terminal logs)

```
✅ POST /v1/receipts → 200
✅ Product: ascend_weekly
✅ Transaction finishing successfully
✅ Environment: Sandbox
```

Purchases work in iOS Sandbox. Focus shifts to **post-purchase activation**, not payment plumbing.

---

## 3. Funnel analysis

### 3.1 Current funnel

```
Sign in / Guest
  → Step 1 (Welcome)
  → Step 2 (Level)
  → Step 3 (Training days)
  → Step 4 (Goal)
  → Paywall (hard block)
  → Home (was empty → now auto-plans)
  → Manual plan creation (fallback)
  → Workout
```

### 3.2 Drop-off hypotheses

| Stage | Hypothesis | Fix |
|-------|------------|-----|
| Sign-in | No sign-up, only guest/email | Add email registration |
| Paywall | No product value shown | Personalized copy + auto-plan promise |
| Post-paywall | Empty Home | ✅ Auto-generate plans from onboarding |
| Day 1 | No guided first workout | ✅ Today's workout hero + checklist |
| Week 1 | No reminders | Week 3: push notifications |
| Trial end | No warning | Week 3: trial countdown banner |

---

## 4. Implementation roadmap

### Week 1 — Activation ✅ (in progress)

| Task | Status | Files |
|------|--------|-------|
| Auto-generate plans from onboarding | ✅ Done | `backend/planGeneration.ts` |
| Call plan gen after purchase | ✅ Done | `app/(onboarding)/paywall.tsx` |
| Today's workout hero on Home | ✅ Done | `app/(tabs)/(home)/index.tsx` |
| Weekly streak on Home | ✅ Done | `app/(tabs)/(home)/index.tsx` |
| Day 1 checklist | ✅ Done | `app/(tabs)/(home)/index.tsx` |
| Fix entitlement ID mismatch | ✅ Done | `constants/revenuecat.ts` |
| Paywall: don't overwrite returning users | ✅ Done | `backend/users.ts` (merge) |
| Paywall: skip duplicate anonymous auth | ✅ Done | `paywall.tsx` |
| Paywall: personalized copy by goal | ✅ Done | `paywall.tsx` |
| Funnel analytics events | ✅ Done | `utils/analytics.ts` |
| Onboarding step analytics | ✅ Done | `step1–4.tsx` |

### Week 2 — Conversion

| Task | Status | Notes |
|------|--------|-------|
| A/B: 1 free workout before paywall | 🔲 | Requires routing change in `app/index.tsx` |
| RevenueCat customer attributes on purchase | 🔲 | `Purchases.setAttributes()` |
| Onboarding step analytics | 🔲 | `onboarding_step_completed` events |
| Subscription status in Profile | 🔲 | Use `hasProAccess` + expiration |
| Android RevenueCat key | 🔲 | `app/_layout.tsx` |

### Week 3 — Retention

| Task | Status | Notes |
|------|--------|-------|
| `expo-notifications` workout reminders | 🔲 | Schedule on training days |
| Trial countdown banner (day 2–3) | 🔲 | Read RC `expirationDate` |
| Daily streak (not just weekly) | 🔲 | `backend/workoutHistory.ts` |
| Post-workout progression banner on Home | 🔲 | After `workout.tsx` completion |

### Week 4 — Optimize

| Task | Status | Notes |
|------|--------|-------|
| RevenueCat webhooks → Firebase | 🔲 | Cloud Function |
| Win-back offering for lapsed users | 🔲 | RC dashboard |
| Review GA4 funnel dashboards | 🔲 | Requires `MEASUREMENT_API_SECRET` |
| Freemium tier (if A/B wins) | 🔲 | Feature-level gating |

---

## 5. Auto-plan generation spec

### 5.1 Trigger

Run `generateInitialPlans(userId)` when:

1. User completes first purchase (`paywall.tsx` → `handlePurchase`)
2. User restores purchase without existing plans (`handleRestore`)

**Idempotent:** Skips if `user.initialPlansGenerated === true` or plans already exist.

### 5.2 Inputs (from `User` document)

| Field | Example | Use |
|-------|---------|-----|
| `goalType` | `strength` | Skill vs path exercise resolver |
| `primaryGoalId` | `push_strength` | Firestore document ID |
| `level` | `beginner` | Starting index in progression |
| `trainingDaysPerWeek` | `3` | Number of day plans to create |

### 5.3 Day assignment

Uses **Mon=1 … Sun=7** convention (matches `getTodaysPlan()`):

| Training days | Assigned days |
|---------------|---------------|
| 1 | Mon |
| 2 | Mon, Thu |
| 3 | Mon, Wed, Fri |
| 4 | Mon–Thu (no Wed) |
| 5 | Mon–Fri |
| 6 | Mon–Sat |
| 7 | Mon–Sun |

### 5.4 Exercise selection

- **Skill goals:** Current progression exercise + next 3 in chain
- **Strength goals:** Level-based slice of path (beginner: first 4, etc.)
- **Per day:** 3 exercises, rotated across training days

### 5.5 Output

Creates N `Plan` documents in Firestore:

```typescript
{
  userId: string;
  goalId: primaryGoalId;
  dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  exercises: [{ exerciseId, sets: 3, target }];
  completed: false;
  createdAt: number;
}
```

Sets `user.initialPlansGenerated = true`.

---

## 6. Analytics event spec

### 6.1 Existing events

| Event | Trigger |
|-------|---------|
| `app_open` | Cold start |
| `paywall_viewed` | Paywall offerings loaded |
| `trial_started` | Successful purchase |
| `purchase_failed` | Failed purchase (not cancel) |
| `workout_completed` | Workout saved to history |

### 6.2 New events (Week 1)

| Event | Trigger | Params |
|-------|---------|--------|
| `onboarding_step_completed` | Step 1–4 continue | `step`, `level`, `training_days`, `goal_type`, `primary_goal_id` |
| `paywall_purchase_tapped` | CTA pressed | `package_id` |
| `plans_generated` | Auto-plan success | `plan_count`, `goal_type` |
| `first_workout_started` | First-ever Start tap | `plan_id` |

### 6.3 Planned events (Week 2+)

| Event | Trigger |
|-------|---------|
| `subscription_started` | Non-trial purchase |
| `trial_day_1` / `trial_day_3` | Scheduled local checks |
| `plan_created` | Manual plan creation |
| `paywall_dismissed` | If freemium skip added |

---

## 7. Home screen spec (Week 1)

### 7.1 Layout priority

1. **Weekly streak badge** (coral fire icon) — if `weeklyStreak > 0`
2. **Day 1 checklist** — if `totalWorkouts === 0` and plans exist
3. **Today's workout hero** — if `getTodaysPlan()` returns a plan
4. **All plans list** — existing cards with TODAY badge on matching plan

### 7.2 Primary CTA

"Start Workout" on today's hero is the **single primary action** for returning users.

---

## 8. Paywall spec (Week 1 updates)

### 8.1 Copy personalization

| User selection | Headline | Subhead |
|----------------|----------|---------|
| Push Strength, 3 days | "Your Push Strength plan is ready" | "Unlock your personalized 3-day strength program..." |
| Muscle Up, 4 days | "Your Muscle Up plan is ready" | "Unlock your personalized 4-day skill program..." |

### 8.2 Post-purchase alert

```
Welcome to Ascend Pro! Your {N}-day {Goal Name} plan is ready.
[Start Day 1]
```

### 8.3 Auth rules

- Use `FIREBASE_AUTH.currentUser` if already signed in (guest from signin)
- Only call `initializeUser` for **new** users with onboarding params
- Use `setDoc(..., { merge: true })` to avoid overwriting returning users

---

## 9. Open questions

1. **Freemium vs hard paywall** — Run A/B in Week 2; need product decision on which features stay free.
2. **Daily vs weekly streak** — Design system uses coral for streaks; weekly is implemented; daily is Week 3.
3. **RevenueCat MCP** — Authenticate in Cursor to pull live conversion charts and cohort data.
4. **Email sign-up** — Should guest remain the only new-user path?

---

## 10. Success criteria for Week 1

- [ ] New subscriber sees ≥1 plan on Home without manual creation
- [ ] Today's workout hero appears on correct day of week
- [ ] `plans_generated` event fires in GA4 (when `MEASUREMENT_API_SECRET` set)
- [ ] No entitlement mismatch between routing and Profile
- [ ] Returning lapsed users are not reset to beginner defaults

---

## Appendix: Key files

| Concern | Path |
|---------|------|
| Entitlement constant | `constants/revenuecat.ts` |
| Plan generation | `backend/planGeneration.ts` |
| Paywall | `app/(onboarding)/paywall.tsx` |
| Home | `app/(tabs)/(home)/index.tsx` |
| Analytics | `utils/analytics.ts` |
| User init | `backend/users.ts` |
| Design system | `ascend.md` |
