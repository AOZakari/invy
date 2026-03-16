/**
 * Stripe checkout session helpers
 * Supports credit card and PayPal via payment_method_types
 */

import { getStripe, STRIPE_PRICE_IDS } from './client';

const PRODUCTION_URL = 'https://invy.rsvp';

export function getValidAppUrl(requestOrigin?: string | null): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  // Reject common invalid values that pass truthiness check
  if (
    envUrl &&
    envUrl !== 'undefined' &&
    envUrl !== 'null' &&
    !envUrl.startsWith('undefined') &&
    envUrl.length > 10
  ) {
    try {
      const parsed = new URL(envUrl.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Fall through to fallbacks
    }
  }
  // Use request origin if valid (e.g. when user is on invy.rsvp)
  if (requestOrigin) {
    try {
      const parsed = new URL(requestOrigin.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Fall through
    }
  }
  return PRODUCTION_URL;
}

/** Trim trailing slashes and whitespace from base URL before building paths */
export function sanitizeBaseUrl(base: string): string {
  return base.trim().replace(/\/+$/, '');
}

export type EventTier = 'keep' | 'pro_event';
export type CheckoutTier = EventTier | 'organizer_hub';

export async function createEventCheckoutSession(params: {
  eventId: string;
  tier: EventTier;
  successUrl?: string;
  cancelUrl?: string;
  adminSecret?: string;
  requestOrigin?: string | null;
}): Promise<{ url: string }> {
  const priceId = params.tier === 'keep' ? STRIPE_PRICE_IDS.keep : STRIPE_PRICE_IDS.proEvent;
  if (!priceId) {
    throw new Error(`Stripe price ID not configured for tier: ${params.tier}`);
  }

  const baseUrl = sanitizeBaseUrl(getValidAppUrl(params.requestOrigin));
  const successUrl = params.successUrl || (params.adminSecret ? `${baseUrl}/manage/${params.adminSecret}?upgraded=true` : `${baseUrl}/dashboard/billing?success=true`);
  const cancelUrl = params.cancelUrl || (params.adminSecret ? `${baseUrl}/manage/${params.adminSecret}?canceled=true` : `${baseUrl}/dashboard/billing?canceled=true`);

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'paypal'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      eventId: params.eventId,
      tier: params.tier,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return { url: session.url };
}

export async function createHubCheckoutSession(params: {
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  requestOrigin?: string | null;
}): Promise<{ url: string }> {
  const priceId = STRIPE_PRICE_IDS.organizerHub;
  if (!priceId) {
    throw new Error('Stripe price ID not configured for Organizer Hub');
  }

  const baseUrl = sanitizeBaseUrl(getValidAppUrl(params.requestOrigin));
  const successUrl = params.successUrl || `${baseUrl}/dashboard/billing?success=true`;
  const cancelUrl = params.cancelUrl || `${baseUrl}/dashboard/billing?canceled=true`;

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'paypal'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: params.userEmail,
    metadata: {
      userId: params.userId,
      tier: 'organizer_hub',
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return { url: session.url };
}

export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return { url: session.url };
}
