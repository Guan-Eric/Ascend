# GA4 Measurement Protocol setup

Ascend logs funnel events from the app via the GA4 Measurement Protocol (`utils/analytics.ts`). Events are **skipped** until `MEASUREMENT_API_SECRET` is set.

## Create the secret

1. Open [Google Analytics](https://analytics.google.com) for property linked to Firebase project `ascend-calisthenics`.
2. **Admin → Data Streams →** select the stream for measurement ID `G-734L1ND7G8`.
3. **Measurement Protocol API secrets → Create**.
4. Copy the secret value.

## Wire it into builds

**Local `.env`:**

```
MEASUREMENT_API_SECRET=<your_secret>
```

**EAS (required for production):**

```bash
eas secret:create --scope project --name MEASUREMENT_API_SECRET --value <your_secret>
```

`eas.json` already maps `MEASUREMENT_API_SECRET` for `development` and `production` profiles. Rebuild the app after setting the secret — env vars are baked at build time via `app.config.js`.

## Verify events

After a rebuild with the secret set:

1. Complete guest onboarding → sample workout → paywall.
2. In GA4: **Reports → Realtime** (or DebugView if using a debug build).
3. Confirm these events appear:
   - `onboarding_step_completed`
   - `sample_workout_started`
   - `sample_workout_completed`
   - `paywall_viewed` (param `source` = `sample_workout`)
   - `paywall_purchase_tapped` / `trial_started` on purchase

If events still skip, check the Metro/device log for:

```
[analytics] Skipped "…" — MEASUREMENT_ID or MEASUREMENT_API_SECRET not set
```
