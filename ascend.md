# Ascend design system

Dark-first, high-contrast, energetic. Near-black base, lime as the single signature action color, coral/violet/green reserved for specific meanings only.

---

## 1. Color tokens

### Core

| Token         | Hex       | Use                                     |
| ------------- | --------- | --------------------------------------- |
| `background`  | `#0D0E10` | App background, deepest layer           |
| `surface`     | `#17181B` | Cards, sheets, tab bar, modals          |
| `border`      | `#2A2B2E` | Hairlines, dividers, input borders      |
| `textPrimary` | `#F5F4F1` | Headlines, body text, primary labels    |
| `textMuted`   | `#8A8B8D` | Secondary text, timestamps, helper copy |

### Accent (signature)

| Token         | Hex       | Use                                                                                   |
| ------------- | --------- | ------------------------------------------------------------------------------------- |
| `lime`        | `#CBFF4D` | Primary CTA, active tab, primary progress fill — the _one_ color that means "do this" |
| `limePressed` | `#A6E62E` | Pressed/active state of any lime element                                              |
| `limeFill`    | `#1E2A0F` | Tinted background behind lime icons/badges                                            |

### Support (meaning-specific — do not use decoratively)

| Token             | Hex       | Meaning                                                        |
| ----------------- | --------- | -------------------------------------------------------------- |
| `coral`           | `#FF6B4A` | Streaks, fire icon, "don't break the chain"                    |
| `coralTextOnTint` | `#3D0F02` | Text/icon on top of coral fills                                |
| `violet`          | `#7C6CFF` | Ascend Pro / paywall / premium-only features                   |
| `violetFill`      | `#150F3D` | Tinted background behind violet badges                         |
| `green`           | `#3A9E7E` | Success states — workout completed, goal hit                   |
| `greenTintBg`     | `#DCEFE7` | Light success banner background (see accessibility note below) |

### Rule of one

Lime is the only color allowed on a primary button. If coral, violet, and green all showed up on one screen fighting for attention, none of them would mean anything. Each support color gets exactly one job:

- **Coral** = streak/fire only
- **Violet** = Pro/paywall only
- **Green** = success confirmation only

---

## 2. Accessibility check (WCAG contrast)

Checked against your actual hex values:

| Pair                             | Ratio      | Passes AA (4.5:1)?                                       |
| -------------------------------- | ---------- | -------------------------------------------------------- |
| Text primary on background       | 17.56:1    | ✅                                                       |
| Text muted on background         | 5.66:1     | ✅                                                       |
| Lime on background               | 16.51:1    | ✅                                                       |
| Coral on background              | 6.85:1     | ✅                                                       |
| Violet on background             | 5.01:1     | ✅ (borderline — fine for text, don't shrink below 14px) |
| Green on background              | 5.86:1     | ✅                                                       |
| Dark bg text on lime button      | 16.51:1    | ✅                                                       |
| Coral text-on-tint on coral fill | 5.88:1     | ✅                                                       |
| **Green text on green tint bg**  | **2.75:1** | ❌ **Fails AA**                                          |

**Fix needed:** `green` (`#3A9E7E`) on `greenTintBg` (`#DCEFE7`) fails contrast — that pairing was built for a light background, which is inconsistent with the rest of this dark-first palette. Two options:

1. Darken the green tint to something like `#0F2A20` (dark tint, consistent with `limeFill`/`violetFill`) and keep `#3A9E7E` as the text/icon color on top of it, or
2. If you specifically want a light success banner, use a much darker green text (e.g. `#1F5C47`) on `#DCEFE7`.

I'd go with option 1 — it matches the pattern you already set with `limeFill` and `violetFill`.

---

## 3. Typography

| Style        | Size | Weight               | Use                                                                                                                 |
| ------------ | ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Display      | 32px | 600                  | Onboarding headlines, empty states                                                                                  |
| Title        | 22px | 600                  | Screen titles                                                                                                       |
| Heading      | 17px | 600                  | Section headers, card titles                                                                                        |
| Body         | 15px | 400                  | Default body copy                                                                                                   |
| Body muted   | 15px | 400, `textMuted`     | Secondary descriptions                                                                                              |
| Caption      | 13px | 500                  | Labels, tags, timestamps                                                                                            |
| Numeric/stat | 28px | 700, tabular figures | Streak counts, rep counts, weights — use a monospaced or tabular-figure font so numbers don't jitter as they change |

Keep two weights max in-app (400 and 600) plus 700 reserved only for large stat numbers, so the hierarchy stays legible against the dark background.

---

## 4. Spacing & radius

| Token         | Value                               |
| ------------- | ----------------------------------- |
| `space-xs`    | 4px                                 |
| `space-sm`    | 8px                                 |
| `space-md`    | 16px                                |
| `space-lg`    | 24px                                |
| `space-xl`    | 32px                                |
| `radius-sm`   | 8px — inputs, small buttons, chips  |
| `radius-md`   | 12px — cards                        |
| `radius-lg`   | 20px — sheets, modals, paywall card |
| `radius-pill` | 999px — streak badge, tags          |

---

## 5. Components

### Primary button

- Fill: `lime`, text: `background` (`#0D0E10`), 600 weight
- Pressed: fill → `limePressed`
- Disabled: fill → `surface`, text → `textMuted`, border → `border`
- Radius: `radius-sm`, height 52px, full-width on primary flows

### Secondary / ghost button

- Transparent fill, 1px `border`, text `textPrimary`
- Pressed: fill → `surface`

### Streak badge

- Icon (flame) + count, `coral` icon, `textPrimary` count
- Background: transparent inline, or `limeFill`-style tint using a coral tint if you add one (currently missing — see gap below)
- Pill radius

### Ascend Pro badge / paywall accents

- `violet` text/icon on `violetFill` background, pill radius, 12–13px caption weight
- Any locked feature icon gets a small violet lock badge, never gray — gray reads as "disabled," violet reads as "upgrade available"

### Success toast / confirmation

- Icon + text in `green`, on the corrected dark tint (see accessibility fix above)
- Auto-dismiss, appears at top or bottom sheet style, not a full-screen takeover — success should feel light, not blocking

### Progress bar / ring (workout, plan completion)

- Track: `border` color at low opacity
- Fill: `lime`
- Completed ring at 100%: fill switches to `green` momentarily, then settles — gives a distinct "done" signal separate from "in progress"

### Cards

- `surface` background, 1px `border`, `radius-md`
- No shadows (flat dark UI reads cleaner without drop shadows on near-black)

### Tab bar

- `surface` background, `border` top hairline
- Active icon/label: `lime`
- Inactive: `textMuted`

---

## 6. Gap to decide on

You have tint backgrounds for lime, violet, and (light) green, but not for coral. If streaks ever need a badge background (not just icon+text), you'll want a `coralFill` — something like `#3D1508` would match the pattern of your other dark tints.

---

## 7. Drop-in code

```ts
// lib/theme.ts
export const colors = {
  background: '#0D0E10',
  surface: '#17181B',
  border: '#2A2B2E',
  textPrimary: '#F5F4F1',
  textMuted: '#8A8B8D',

  lime: '#CBFF4D',
  limePressed: '#A6E62E',
  limeFill: '#1E2A0F',

  coral: '#FF6B4A',
  coralTextOnTint: '#3D0F02',
  coralFill: '#3D1508', // suggested addition, matches limeFill/violetFill pattern

  violet: '#7C6CFF',
  violetFill: '#150F3D',

  green: '#3A9E7E',
  greenTintBg: '#0F2A20', // corrected: dark tint instead of light, fixes contrast fail
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
```

```js
// tailwind.config.js excerpt
colors: {
  background: '#0D0E10',
  surface: '#17181B',
  border: '#2A2B2E',
  'text-primary': '#F5F4F1',
  'text-muted': '#8A8B8D',
  lime: { DEFAULT: '#CBFF4D', pressed: '#A6E62E', fill: '#1E2A0F' },
  coral: { DEFAULT: '#FF6B4A', 'text-on-tint': '#3D0F02', fill: '#3D1508' },
  violet: { DEFAULT: '#7C6CFF', fill: '#150F3D' },
  success: { DEFAULT: '#3A9E7E', fill: '#0F2A20' },
},
```
