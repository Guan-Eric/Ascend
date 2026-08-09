# Ascend design system

Quiet chrome, typography-led, almost no cards. Light canvas by default with a single teal accent. Name stays **Ascend**.

Source of truth for product direction: [docs/REVAMP.md](./docs/REVAMP.md). This file tracks the visual system after Wave A.

---

## 1. Color tokens

### Core

| Token         | Hex       | Use                                      |
| ------------- | --------- | ---------------------------------------- |
| `canvas`      | `#FAFAF8` | App background                           |
| `surface`     | `#FFFFFF` | Quiet elevated surfaces                  |
| `border`      | `#E5E5E1` | Hairlines, dividers, input borders       |
| `textPrimary` | `#111111` | Headlines, body, primary labels          |
| `textMuted`   | `#6B6B6B` | Secondary text, helpers                  |
| `dark`        | `#0C0C0C` | Inverse surfaces / optional dark theme   |

### Accent (signature)

| Token           | Hex       | Use                                                         |
| --------------- | --------- | ----------------------------------------------------------- |
| `accent`        | `#0F766E` | Primary CTA, active tab, progress fill — the _one_ action color |
| `accentPressed` | `#0B5F59` | Pressed/active state of accent elements                     |

### Support (meaning-specific — do not use decoratively)

| Token   | Hex       | Meaning                         |
| ------- | --------- | ------------------------------- |
| `coral` | `#C2410C` | Streaks / fire only             |
| `error` | `#B91C1C` | Destructive actions             |
| `success` | `#0F766E` | Success may reuse accent (quiet) |

### Rule of one

Teal accent is the only color allowed on a primary button. No neon lime, no violet Pro signature, no cream-as-brand, no purple gradients.

---

## 2. Typography

**Family:** DM Sans (geometric sans)

| Style      | Size | Weight | Use                                      |
| ---------- | ---- | ------ | ---------------------------------------- |
| Display    | 32px | 600    | Onboarding / paywall headlines           |
| Title      | 22–28px | 600 | Screen titles (“Today”, “Plan”, …)     |
| Heading    | 17px | 600    | Section headers, session names           |
| Body       | 15px | 400    | Default body                             |
| Body muted | 15px | 400    | Secondary descriptions (`textMuted`)     |
| Caption    | 13px | 500    | Labels, timestamps                       |
| Stat       | 28px | 700    | Large numbers only                       |

Weights in-app: 400 / 500 / 600; 700 reserved for stats.

---

## 3. Spacing & radius

| Token       | Value |
| ----------- | ----- |
| `space-xs`  | 4px   |
| `space-sm`  | 8px   |
| `space-md`  | 16px  |
| `space-lg`  | 24px  |
| `space-xl`  | 32px  |
| `radius-sm` | 8px   |
| `radius-md` | 12px  |
| `radius-lg` | 20px  |

Prefer list rows + hairlines over cards. If removing a border/shadow/radius doesn’t hurt understanding, don’t use a card.

---

## 4. Components

### Primary button

- Fill: `accent`, text: `canvas` (`#FAFAF8`), 600 weight
- Pressed: `accentPressed`
- Radius: `radius-sm`, height ~52px, full-width on primary flows

### Ghost / link

- Ghost: 1px `border`, text `textPrimary`
- Link: text `accent`, no chrome

### Screen

- Canvas background, safe-area top padding, horizontal `space-lg`
- One job per screen; prefer empty space over secondary widgets

### Segment control

- Quiet track (`surface-elevated`), selected pill = `surface`
- Used for Plan Month|Week and Progress Skills|Strength

### Progress bar

- Track: `surface-elevated`
- Fill: `accent`

### Tab bar

- Canvas background, `border` top hairline
- Active: `accent` · Inactive: `textMuted`
- Labels: **Today · Plan · Progress · You**

---

## 5. Navigation (4 tabs)

| Tab        | One job                                              |
| ---------- | ---------------------------------------------------- |
| **Today**  | Do / log today’s work + at most one coach banner     |
| **Plan**   | Calendar (month default, week list)                  |
| **Progress** | Browse Skills \| Strength                          |
| **You**    | Account, appearance, Pro, check-in cadence           |

---

## 6. Brand assets

| Asset  | Path                         | Notes                          |
| ------ | ---------------------------- | ------------------------------ |
| Icon   | `assets/ascend_icon.png`     | Three-step peak, teal on canvas |
| Splash | `assets/ascend_splash.png`   | Wordmark + mark on `#FAFAF8`   |

---

## 7. Drop-in tokens

```ts
// utils/theme.ts (excerpt)
export const colors = {
  canvas: '#FAFAF8',
  text: '#111111',
  muted: '#6B6B6B',
  accent: '#0F766E',
  accentPressed: '#0B5F59',
  dark: '#0C0C0C',
  surface: '#FFFFFF',
  border: '#E5E5E1',
  coral: '#C2410C',
  error: '#B91C1C',
} as const;
```

Legacy multi-theme packs (matcha / ube / zen / coffee / lime-ascend) are retired. Appearance may toggle light | dark only.
