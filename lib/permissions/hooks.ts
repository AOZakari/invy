/**
 * Client-side permission hooks
 * Use these in React components for UI gating
 */

'use client';

import { useMemo } from 'react';
import type { User, Event } from '@/types/database';
import type { Feature } from './features';
import { canUseFeature, canManageEvent, isSuperAdmin, getEffectiveTier } from './capabilities';

/**
 * Hook to check if user can use a feature
 */
export function useFeatureAccess(
  user: User | null,
  event: Event,
  feature: Feature
): boolean {
  return useMemo(() => canUseFeature(user, event, feature), [user, event, feature]);
}

/**
 * Hook to check if user can manage an event
 */
export function useCanManageEvent(user: User | null, event: Event): boolean {
  return useMemo(() => canManageEvent(user, event), [user, event]);
}

/**
 * Hook to check if user is super-admin
 */
export function useIsSuperAdmin(user: User | null): boolean {
  return useMemo(() => isSuperAdmin(user), [user]);
}

/**
 * Hook to get effective tier
 */
export function useEffectiveTier(user: User | null, event: Event) {
  return useMemo(() => getEffectiveTier(user, event), [user, event]);
}

