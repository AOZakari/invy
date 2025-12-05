import { getUserFromSession } from '@/lib/auth/user';
import { getEventsByOrganizerEmail } from '@/lib/db/events';
import { claimEvent } from '@/lib/db/events';
import { redirect } from 'next/navigation';
import ClaimEventsForm from '@/components/ClaimEventsForm';

export default async function ClaimPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  // Find unclaimed events with matching email
  const unclaimedEvents = await getEventsByOrganizerEmail(user.email);

  if (unclaimedEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Claim Your Events</h1>
          <p className="text-gray-600 dark:text-gray-400">
            No unclaimed events found for your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Claim Your Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We found {unclaimedEvents.length} event{unclaimedEvents.length !== 1 ? 's' : ''} created with your email.
          Claim them to manage them in your dashboard.
        </p>
      </div>

      <ClaimEventsForm events={unclaimedEvents} userId={user.id} />
    </div>
  );
}

