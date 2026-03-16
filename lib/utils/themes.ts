/**
 * Theme utilities for INVY event pages
 * Delegates to preset system for full visual control
 */

import type { Theme } from '@/types/database';
import { getThemePreset } from './presets';

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'rose', label: 'Rose' },
  { value: 'lavender', label: 'Lavender' },
];

export const FREE_THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export interface ThemeClasses {
  main: string;
  input: string;
  error: string;
  button: string;
  surface?: string;
  muted?: string;
  border?: string;
  shadow?: string;
  overlay?: string;
  accent?: string;
  radius?: 'subtle' | 'medium' | 'rounded';
}

/** Get theme classes for event page components (backward compatible + extended) */
export function getThemeClasses(theme: Theme): ThemeClasses {
  const preset = getThemePreset(theme);
  return {
    main: preset.main,
    input: preset.input,
    error: preset.error,
    button: preset.button,
    surface: preset.surface,
    muted: preset.muted,
    border: preset.border,
    shadow: preset.shadow,
    overlay: preset.overlay,
    accent: preset.accent,
    radius: preset.radius,
  };
}
