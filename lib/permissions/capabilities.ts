/**
 * Capability checking utilities
 * Determines effective tier and feature access
 */

import type { User, Event, PlanTier } from '@/types/database';
import type { Feature } from './features';
import { featureRequirements } from './features';

/**
 * Get the effective plan tier for a user/event combination
 * Super-admin always gets business tier access
 * Event-level tier can override user-level tier
 */
export function getEffectiveTier(user: User | null, event: Event | { plan_tier?: PlanTier | null }): PlanTier {
  // Super-admin bypasses all restrictions
  if (user?.role === 'superadmin') {
    return 'business';
  }

  // Anonymous users (no user record) use event tier or default to free
  if (!user) {
    return event.plan_tier || 'free';
  }

  // Use the higher tier between user and event
  const tiers: PlanTier[] = ['free', 'pro', 'business'];
  const userTierIndex = tiers.indexOf(user.plan_tier);
  const eventTierIndex = tiers.indexOf(event.plan_tier || 'free');

  return tiers[Math.max(userTierIndex, eventTierIndex)];
}

/**
 * Check if a user/event combination can use a specific feature
 */
export function canUseFeature(
  user: User | null,
  event: Event | { plan_tier?: PlanTier | null; keep_live?: boolean },
  feature: Feature
): boolean {
  // Plus (keep_live): event stays live, CSV export, QR code, 1 custom RSVP field
  if (event.keep_live) {
    if (['csv_export', 'qr_code', 'custom_rsvp_fields'].includes(feature)) {
      return true;
    }
  }
  const effectiveTier = getEffectiveTier(user, event);
  const requiredTiers = featureRequirements[feature];
  return requiredTiers.includes(effectiveTier);
}

/**
 * Check if user is super-admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'superadmin' || false;
}

/**
 * Check if user owns an event
 */
export function ownsEvent(user: User | null, event: Event): boolean {
  if (!user) return false;
  return event.owner_user_id === user.id;
}

/**
 * Check if user can manage an event (owns it OR is super-admin)
 */
export function canManageEvent(user: User | null, event: Event): boolean {
  if (isSuperAdmin(user)) return true;
  return ownsEvent(user, event);
}

/**
 * Check if user can claim an event (email matches organizer_email)
 */
export function canClaimEvent(user: User | null, event: Event): boolean {
  if (!user) return false;
  if (event.owner_user_id) return false; // Already claimed
  return user.email.toLowerCase() === event.organizer_email.toLowerCase();
}

