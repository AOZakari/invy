import { getUserFromSession } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PRICING } from '@/types/database';

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
          Manage your subscription and billing
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold capitalize">{user.plan_tier}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.plan_tier === 'free'
                ? 'Basic features'
                : user.plan_tier === 'pro'
                ? 'Pro features included'
                : 'All features included'}
            </p>
          </div>
          {user.plan_tier !== 'business' && (
            <Link
              href="/dashboard/billing/upgrade"
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Pro</h3>
          <p className="text-3xl font-bold mb-4">
            ${PRICING.pro.monthly}
            <span className="text-base font-normal text-gray-600 dark:text-gray-400">
              /month
            </span>
          </p>
          <ul className="space-y-2 text-sm mb-6">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Custom event slugs
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Advanced themes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              CSV export
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Guest list controls
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Capacity limits
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Custom RSVP fields
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Analytics
            </li>
          </ul>
          {user.plan_tier === 'free' && (
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
            >
              Coming soon
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 border-blue-500">
          <h3 className="text-lg font-semibold mb-2">Business</h3>
          <p className="text-3xl font-bold mb-4">
            ${PRICING.business.monthly}
            <span className="text-base font-normal text-gray-600 dark:text-gray-400">
              /month
            </span>
          </p>
          <ul className="space-y-2 text-sm mb-6">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Everything in Pro
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Share controls
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Email reminders
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              White-label options
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Priority support
            </li>
          </ul>
          {user.plan_tier !== 'business' && (
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
            >
              Coming soon
            </button>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Stripe integration is being prepared. Billing will be available soon.
        </p>
      </div>
    </div>
  );
}

