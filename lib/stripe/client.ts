/**
 * Stripe client configuration
 * Prepared for future Stripe integration
 */

// TODO: Install stripe package when ready
// import Stripe from 'stripe';

// const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
// if (!stripeSecretKey) {
//   throw new Error('Missing STRIPE_SECRET_KEY environment variable');
// }

// export const stripe = new Stripe(stripeSecretKey, {
//   apiVersion: '2024-12-18.acacia',
// });

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
  pro: {
    priceIdMonthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY || '',
  },
  business: {
    priceIdMonthly: process.env.STRIPE_BUSINESS_PRICE_ID_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_BUSINESS_PRICE_ID_YEARLY || '',
  },
} as const;

/**
 * Create Stripe checkout session
 * TODO: Implement when Stripe is integrated
 */
export async function createCheckoutSession(params: {
  userId: string;
  planTier: 'pro' | 'business';
  billingPeriod: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  // Placeholder - implement when Stripe is ready
  throw new Error('Stripe integration not yet implemented');
}

/**
 * Create Stripe customer portal session
 * TODO: Implement when Stripe is integrated
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  // Placeholder - implement when Stripe is ready
  throw new Error('Stripe integration not yet implemented');
}

