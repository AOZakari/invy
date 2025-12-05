import { getUserFromSession } from '@/lib/auth/user';
import { getEventsByUserId } from '@/lib/db/events';
import EventsList from '@/components/EventsList';
import DashboardOverview from '@/components/DashboardOverview';

export default async function DashboardPage() {
  const user = await getUserFromSession();
  if (!user) {
    return null; // Layout will redirect
  }

  const events = await getEventsByUserId(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your events in one place
        </p>
      </div>

      <DashboardOverview userId={user.id} />
      <EventsList userId={user.id} />
    </div>
  );
}

