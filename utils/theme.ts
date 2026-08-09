// utils/theme.ts — Ascend Wave A tokens + native color helpers
import { useUniwind } from "uniwind";

export const colors = {
  canvas: "#FAFAF8",
  text: "#111111",
  muted: "#6B6B6B",
  accent: "#0F766E",
  accentPressed: "#0B5F59",
  dark: "#0C0C0C",
  surface: "#FFFFFF",
  border: "#E5E5E1",
  success: "#0F766E",
  warning: "#B45309",
  error: "#B91C1C",
  coral: "#C2410C",
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

type ColorKey =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "coral"
  | "background"
  | "text"
  | "muted"
  | "border";

const themeColors: Record<"light" | "dark", Record<ColorKey, string>> = {
  light: {
    primary: colors.accent,
    secondary: colors.text,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    coral: colors.coral,
    background: colors.canvas,
    text: colors.text,
    muted: colors.muted,
    border: colors.border,
  },
  dark: {
    primary: "#2DD4BF",
    secondary: colors.canvas,
    success: "#2DD4BF",
    warning: "#F59E0B",
    error: "#F87171",
    coral: "#FB923C",
    background: colors.dark,
    text: colors.canvas,
    muted: "#A3A3A3",
    border: "#2A2A2A",
  },
};

export const getThemeColor = (
  theme: string,
  colorKey: ColorKey = "primary"
) => {
  const palette =
    theme === "dark" ? themeColors.dark : themeColors.light;
  return palette[colorKey] ?? themeColors.light[colorKey];
};

export const useThemeColor = (colorKey: ColorKey = "primary") => {
  const { theme } = useUniwind();
  return getThemeColor(theme, colorKey);
};
