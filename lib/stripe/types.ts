/**
 * Stripe-related types
 * Prepared for future Stripe integration
 */

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export interface StripeCustomer {
  id: string;
  email: string;
}

export interface StripePrice {
  id: string;
  amount: number;
  currency: string;
  recurring: {
    interval: 'month' | 'year';
  };
}

