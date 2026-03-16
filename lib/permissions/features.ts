/**
 * Feature definitions and requirements
 * Maps features to the minimum plan tier required
 */

import type { PlanTier } from '@/types/database';

export type Feature =
  | 'custom_slug'
  | 'advanced_themes'
  | 'csv_export'
  | 'guest_list_controls'
  | 'capacity_limits'
  | 'link_preview_cards'
  | 'analytics'
  | 'custom_rsvp_fields'
  | 'share_controls'
  | 'email_reminders'
  | 'qr_code'
  | 'white_label'
  | 'page_style'
  | 'cover_image'
  | 'poster_image'
  | 'request_to_attend'
  | 'organizer_contact';

/**
 * Feature requirements matrix
 * Each feature requires at least the specified tier
 */
export const featureRequirements: Record<Feature, PlanTier[]> = {
  custom_slug: ['pro', 'business'],
  advanced_themes: ['pro', 'business'],
  csv_export: ['pro', 'business'],
  guest_list_controls: ['pro', 'business'],
  capacity_limits: ['pro', 'business'],
  link_preview_cards: ['pro', 'business'],
  analytics: ['pro', 'business'],
  custom_rsvp_fields: ['pro', 'business'],
  share_controls: ['business'],
  email_reminders: ['business'],
  qr_code: ['pro', 'business'],
  white_label: ['business'],
  page_style: ['pro', 'business'],
  cover_image: ['pro', 'business'],
  poster_image: ['pro', 'business'],
  request_to_attend: ['pro', 'business'],
  organizer_contact: ['pro', 'business'],
};

/**
 * Get all features available for a given tier
 */
export function getFeaturesForTier(tier: PlanTier): Feature[] {
  return Object.entries(featureRequirements)
    .filter(([_, requiredTiers]) => requiredTiers.includes(tier))
    .map(([feature]) => feature as Feature);
}

/**
 * Check if a tier has access to a feature
 */
export function tierHasFeature(tier: PlanTier, feature: Feature): boolean {
  return featureRequirements[feature].includes(tier);
}

