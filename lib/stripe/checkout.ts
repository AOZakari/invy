/**
 * Stripe checkout session helpers
 * Supports credit card and PayPal via payment_method_types
 */

import { getStripe, STRIPE_PRICE_IDS } from './client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

export type EventTier = 'keep' | 'pro_event';
export type CheckoutTier = EventTier | 'organizer_hub';

export async function createEventCheckoutSession(params: {
  eventId: string;
  tier: EventTier;
  successUrl?: string;
  cancelUrl?: string;
  adminSecret?: string;
}): Promise<{ url: string }> {
  const priceId = params.tier === 'keep' ? STRIPE_PRICE_IDS.keep : STRIPE_PRICE_IDS.proEvent;
  if (!priceId) {
    throw new Error(`Stripe price ID not configured for tier: ${params.tier}`);
  }

  const successUrl = params.successUrl || (params.adminSecret ? `${APP_URL}/manage/${params.adminSecret}?upgraded=true` : `${APP_URL}/dashboard/billing?success=true`);
  const cancelUrl = params.cancelUrl || (params.adminSecret ? `${APP_URL}/manage/${params.adminSecret}?canceled=true` : `${APP_URL}/dashboard/billing?canceled=true`);

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'paypal'],
    line_items: [{ price: priceId, quantity: 1 }],
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
}): Promise<{ url: string }> {
  const priceId = STRIPE_PRICE_IDS.organizerHub;
  if (!priceId) {
    throw new Error('Stripe price ID not configured for Organizer Hub');
  }

  const successUrl = params.successUrl || `${APP_URL}/dashboard/billing?success=true`;
  const cancelUrl = params.cancelUrl || `${APP_URL}/dashboard/billing?canceled=true`;

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'paypal'],
    line_items: [{ price: priceId, quantity: 1 }],
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
