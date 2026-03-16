'use client';

import { useState } from 'react';
import { MVP_PRICING } from '@/types/database';
import type { User } from '@/types/database';

interface BillingPlansProps {
  user: User;
}

export default function BillingPlans({ user }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(tier: 'keep' | 'pro_event' | 'organizer_hub', eventId?: string, adminSecret?: string) {
    setLoading(tier);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          ...(tier !== 'organizer_hub' && eventId && adminSecret ? { eventId, adminSecret } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading('portal');
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open portal');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  const hasHub = user.plan_tier === 'pro' || user.plan_tier === 'business';
  const hasStripeCustomer = !!user.stripe_customer_id;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.keep.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.keep.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">per event</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Keep your event live longer. One-off.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upgrade from the event manage page.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.proEvent.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.proEvent.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">per event</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Pro features for a single event. One-off.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upgrade from the event manage page.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-900 dark:border-white p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.organizerHub.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.organizerHub.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">/ month</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            All events, reminders, and more. Subscription.
          </p>
          {hasHub && hasStripeCustomer ? (
            <button
              onClick={handleManageBilling}
              disabled={!!loading}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {loading === 'portal' ? 'Opening...' : 'Manage subscription'}
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade('organizer_hub')}
              disabled={!!loading}
              className="w-full px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading === 'organizer_hub' ? 'Redirecting...' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keep and Pro Event are one-time upgrades per event — use the upgrade section on each event&apos;s manage page. Organizer Hub is a monthly subscription. Your data is kept only as long as needed; free events expire 7 days after the event date.
        </p>
      </div>
    </div>
  );
}
