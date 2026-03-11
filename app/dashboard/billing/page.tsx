import { getUserFromSession } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import { MVP_PRICING } from '@/types/database';

export default async function BillingPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upgrade when you need more. Billing is not active yet.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-2">Current plan</h2>
        <p className="text-2xl font-bold capitalize">{user.plan_tier}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Free plan — create events, collect RSVPs, manage via email link.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.keep.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.keep.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">per event</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Keep your event live longer. One-off.
          </p>
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.proEvent.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.proEvent.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">per event</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Pro features for a single event. One-off.
          </p>
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-900 dark:border-white p-6">
          <h3 className="text-lg font-semibold mb-2">{MVP_PRICING.organizerHub.label}</h3>
          <p className="text-3xl font-bold mb-1">€{MVP_PRICING.organizerHub.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">/ month</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            All events, reminders, and more. Subscription.
          </p>
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Payments are not enabled yet. We’ll notify you when you can upgrade. Your data is kept only as long as needed; free events expire 7 days after the event date.
        </p>
      </div>
    </div>
  );
}
