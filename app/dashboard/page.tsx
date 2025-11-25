import { getEventsByUserId } from '@/lib/db/events';
import { supabaseServer } from '@/lib/supabase/server';
import EventsList from '@/components/EventsList';
import DashboardOverview from '@/components/DashboardOverview';

export default async function DashboardPage() {
  // Get current user (Phase 6 - placeholder)
  // In production, get from Supabase auth session
  const userId = 'placeholder-user-id'; // TODO: Get from auth session

  // For now, show empty state or placeholder
  // Once auth is set up, uncomment:
  /*
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) {
    return <div>Please log in</div>;
  }

  const events = await getEventsByUserId(session.user.id);
  */

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your events in one place
        </p>
      </div>

      <DashboardOverview userId={userId} />
      <EventsList userId={userId} />
    </div>
  );
}

