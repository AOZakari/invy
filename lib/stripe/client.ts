/**
 * Stripe client configuration
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2026-02-25.clover',
  });
}

export const STRIPE_PRICE_IDS = {
  keep: process.env.STRIPE_KEEP_PRICE_ID || '',
  proEvent: process.env.STRIPE_PRO_EVENT_PRICE_ID || '',
  organizerHub: process.env.STRIPE_ORGANIZER_HUB_PRICE_ID || '',
} as const;
