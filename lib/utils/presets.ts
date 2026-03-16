/**
 * Central preset configuration for INVY premium event pages
 * Theme = vibe, PageStyle = personality, Images = identity
 */

import type { Theme } from '@/types/database';

export type PageStyle = 'classic' | 'modern' | 'bold';
export type CoverImagePosition = 'top' | 'center' | 'bottom';

// -----------------------------------------------------------------------------
// Theme presets: curated visual personalities
// -----------------------------------------------------------------------------

export interface ThemePreset {
  id: Theme;
  label: string;
  /** Main page background */
  main: string;
  /** Surface/card background for RSVP block, metadata chips */
  surface: string;
  /** Input field styling */
  input: string;
  /** Error state */
  error: string;
  /** Primary button */
  button: string;
  /** Button hover (optional override) */
  buttonHover?: string;
  /** Muted/secondary text */
  muted: string;
  /** Border for cards/surfaces */
  border: string;
  /** Shadow for cards */
  shadow: string;
  /** Border radius personality: subtle | medium | rounded */
  radius: 'subtle' | 'medium' | 'rounded';
  /** Image overlay for hero (when cover image present) */
  overlay: string;
  /** Accent for metadata chips, links */
  accent: string;
}

export const THEME_PRESETS: Record<Theme, ThemePreset> = {
  light: {
    id: 'light',
    label: 'Light',
    main: 'bg-white text-gray-900',
    surface: 'bg-gray-50/80 border-gray-200/80',
    input: 'bg-white border-gray-300 text-gray-900 focus:ring-gray-900 focus:border-gray-900',
    error: 'bg-red-50 border border-red-200 text-red-800',
    button: 'bg-gray-900 text-white hover:bg-gray-800',
    muted: 'text-gray-500',
    border: 'border-gray-200',
    shadow: 'shadow-sm',
    radius: 'medium',
    overlay: 'bg-white/60',
    accent: 'text-gray-900',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    main: 'bg-gray-950 text-gray-100',
    surface: 'bg-gray-900/80 border-gray-800/80',
    input: 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-white focus:border-gray-600',
    error: 'bg-red-900/20 border border-red-800 text-red-200',
    button: 'bg-white text-gray-900 hover:bg-gray-100',
    muted: 'text-gray-400',
    border: 'border-gray-800',
    shadow: 'shadow-lg shadow-black/20',
    radius: 'medium',
    overlay: 'bg-gray-950/70',
    accent: 'text-white',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    main: 'bg-slate-900 text-slate-100',
    surface: 'bg-slate-800/60 border-slate-700/80',
    input: 'bg-slate-800 border-slate-600 text-slate-100 focus:ring-sky-400 focus:border-sky-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-sky-500 text-white hover:bg-sky-400',
    muted: 'text-slate-400',
    border: 'border-slate-700',
    shadow: 'shadow-xl shadow-slate-900/30',
    radius: 'rounded',
    overlay: 'bg-slate-900/60',
    accent: 'text-sky-400',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    main: 'bg-emerald-950 text-emerald-50',
    surface: 'bg-emerald-900/40 border-emerald-800/60',
    input: 'bg-emerald-900/50 border-emerald-700 text-emerald-50 focus:ring-emerald-400 focus:border-emerald-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400',
    muted: 'text-emerald-400',
    border: 'border-emerald-800',
    shadow: 'shadow-xl shadow-emerald-950/20',
    radius: 'medium',
    overlay: 'bg-emerald-950/65',
    accent: 'text-emerald-400',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    main: 'bg-orange-950 text-orange-50',
    surface: 'bg-orange-900/40 border-orange-800/60',
    input: 'bg-orange-900/50 border-orange-700 text-orange-50 focus:ring-amber-400 focus:border-amber-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-amber-500 text-orange-950 hover:bg-amber-400',
    muted: 'text-orange-400',
    border: 'border-orange-800',
    shadow: 'shadow-xl shadow-orange-950/25',
    radius: 'rounded',
    overlay: 'bg-orange-950/60',
    accent: 'text-amber-400',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    main: 'bg-indigo-950 text-indigo-100',
    surface: 'bg-indigo-900/50 border-indigo-800/80',
    input: 'bg-indigo-900/50 border-indigo-700 text-indigo-100 focus:ring-indigo-400 focus:border-indigo-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-indigo-500 text-white hover:bg-indigo-400',
    muted: 'text-indigo-400',
    border: 'border-indigo-800',
    shadow: 'shadow-2xl shadow-indigo-950/40',
    radius: 'subtle',
    overlay: 'bg-indigo-950/75',
    accent: 'text-indigo-400',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    main: 'bg-rose-950 text-rose-50',
    surface: 'bg-rose-900/40 border-rose-800/60',
    input: 'bg-rose-900/50 border-rose-700 text-rose-50 focus:ring-rose-400 focus:border-rose-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-rose-500 text-rose-950 hover:bg-rose-400',
    muted: 'text-rose-400',
    border: 'border-rose-800',
    shadow: 'shadow-xl shadow-rose-950/20',
    radius: 'rounded',
    overlay: 'bg-rose-950/65',
    accent: 'text-rose-400',
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    main: 'bg-violet-950 text-violet-100',
    surface: 'bg-violet-900/40 border-violet-800/60',
    input: 'bg-violet-900/50 border-violet-700 text-violet-100 focus:ring-violet-400 focus:border-violet-500',
    error: 'bg-red-900/20 border border-red-700 text-red-200',
    button: 'bg-violet-500 text-white hover:bg-violet-400',
    muted: 'text-violet-400',
    border: 'border-violet-800',
    shadow: 'shadow-xl shadow-violet-950/25',
    radius: 'rounded',
    overlay: 'bg-violet-950/65',
    accent: 'text-violet-400',
  },
};

// -----------------------------------------------------------------------------
// Page style presets: layout personality
// -----------------------------------------------------------------------------

export interface PageStylePreset {
  id: PageStyle;
  label: string;
  /** Hero composition: centered | wide | split */
  heroLayout: 'centered' | 'wide' | 'split';
  /** Card shape: flat | elevated | floating */
  cardStyle: 'flat' | 'elevated' | 'floating';
  /** Title size: compact | standard | bold */
  titleScale: 'compact' | 'standard' | 'bold';
  /** Spacing density */
  spacing: 'tight' | 'normal' | 'generous';
  /** Metadata arrangement: stacked | inline | chips */
  metadataLayout: 'stacked' | 'inline' | 'chips';
  /** Poster/card image treatment when present */
  posterTreatment: 'floating' | 'card' | 'badge';
}

export const PAGE_STYLE_PRESETS: Record<PageStyle, PageStylePreset> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    heroLayout: 'centered',
    cardStyle: 'elevated',
    titleScale: 'standard',
    spacing: 'generous',
    metadataLayout: 'stacked',
    posterTreatment: 'card',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    heroLayout: 'wide',
    cardStyle: 'flat',
    titleScale: 'standard',
    spacing: 'normal',
    metadataLayout: 'chips',
    posterTreatment: 'floating',
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    heroLayout: 'wide',
    cardStyle: 'floating',
    titleScale: 'bold',
    spacing: 'generous',
    metadataLayout: 'chips',
    posterTreatment: 'floating',
  },
};

// -----------------------------------------------------------------------------
// Radius mapping
// -----------------------------------------------------------------------------

export const RADIUS_CLASSES = {
  subtle: 'rounded-lg',
  medium: 'rounded-xl',
  rounded: 'rounded-2xl',
} as const;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function getThemePreset(theme: Theme): ThemePreset {
  return THEME_PRESETS[theme] ?? THEME_PRESETS.light;
}

export function getPageStylePreset(style: PageStyle): PageStylePreset {
  return PAGE_STYLE_PRESETS[style] ?? PAGE_STYLE_PRESETS.modern;
}

export function getRadiusClass(radius: ThemePreset['radius']): string {
  return RADIUS_CLASSES[radius];
}
