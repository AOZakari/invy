/**
 * Server-side permission checks
 * Use these in API routes and server components
 */

import type { User, Event } from '@/types/database';
import type { Feature } from './features';
import { canUseFeature, canManageEvent, isSuperAdmin } from './capabilities';

/**
 * Assert that user can use a feature, throw error if not
 */
export function assertCanUseFeature(
  user: User | null,
  event: Event,
  feature: Feature
): void {
  if (!canUseFeature(user, event, feature)) {
    throw new Error(`Feature "${feature}" requires Pro or Business tier`);
  }
}

/**
 * Assert that user can manage an event, throw error if not
 */
export function assertCanManageEvent(
  user: User | null,
  event: Event
): void {
  if (!canManageEvent(user, event)) {
    throw new Error('You do not have permission to manage this event');
  }
}

/**
 * Assert that user is super-admin, throw error if not
 */
export function assertIsSuperAdmin(user: User | null): void {
  if (!isSuperAdmin(user)) {
    throw new Error('Super-admin access required');
  }
}

/**
 * Check feature access and return boolean (non-throwing)
 */
export function checkFeatureAccess(
  user: User | null,
  event: Event,
  feature: Feature
): boolean {
  return canUseFeature(user, event, feature);
}

