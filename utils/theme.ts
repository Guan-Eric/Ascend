// utils/theme.ts - Theme utility for getting primary color
import { useUniwind } from 'uniwind';

export const getThemeColor = (theme: string, colorKey: 'primary' | 'secondary' | 'success' | 'warning' | 'error') => {
  const themeColors: Record<string, Record<string, string>> = {
    dark: {
      primary: '#00d9ff',
      secondary: '#7c3aed',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    light: {
      primary: '#3b82f6',
      secondary: '#7c3aed',
      success: '#16a34a',
      warning: '#eab308',
      error: '#dc2626',
    },
    matcha: {
      primary: '#6fa76f',
      secondary: '#a3c9a8',
      success: '#4ade80',
      warning: '#facc15',
      error: '#ef4444',
    },
    ube: {
      primary: '#a78bfa',
      secondary: '#f472b6',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#fb7185',
    },
    zen: {
      primary: '#64748b',
      secondary: '#94a3b8',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
    },
    coffee: {
      primary: '#c08457',
      secondary: '#7a4a2e',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  };

  return themeColors[theme]?.[colorKey] || themeColors.dark[colorKey];
};

export const useThemeColor = (colorKey: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary') => {
  const { theme } = useUniwind();
  return getThemeColor(theme, colorKey);
};