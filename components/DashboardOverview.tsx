import { getEventsByUserId } from '@/lib/db/events';
import { getRsvpStatsForEvent } from '@/lib/db/rsvps';

interface DashboardOverviewProps {
  userId: string;
}

export default async function DashboardOverview({ userId }: DashboardOverviewProps) {
  const events = await getEventsByUserId(userId);

  // Calculate totals
  let totalEvents = events.length;
  let totalRsvps = 0;
  let upcomingEvents = 0;

  if (events.length > 0) {
    for (const event of events) {
      const stats = await getRsvpStatsForEvent(event.id);
      totalRsvps += stats.total;
      if (new Date(event.starts_at) > new Date()) {
        upcomingEvents++;
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-2xl font-bold">{totalEvents}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-2xl font-bold">{totalRsvps}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total RSVPs</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-2xl font-bold">{upcomingEvents}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</div>
      </div>
    </div>
  );
}

