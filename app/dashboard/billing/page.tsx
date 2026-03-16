import { getUserFromSession } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import BillingPlans from '@/components/BillingPlans';
import BillingSuccess from '@/components/BillingSuccess';

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
          Upgrade when you need more. Credit card and PayPal accepted.
        </p>
      </div>

      <BillingSuccess />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-2">Current plan</h2>
        <p className="text-2xl font-bold capitalize">{user.plan_tier}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {user.plan_tier === 'free'
            ? 'Free plan — create events, collect RSVPs, manage via email link.'
            : 'You have access to Organizer Hub features.'}
        </p>
      </div>

      <BillingPlans user={user} />
    </div>
  );
}
