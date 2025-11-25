import { getEventsByUserId } from '@/lib/db/events';
import { getRsvpStatsForEvent } from '@/lib/db/rsvps';
import Link from 'next/link';

interface EventsListProps {
  userId: string;
}

export default async function EventsList({ userId }: EventsListProps) {
  // Placeholder - will work once auth is set up
  const events = userId !== 'placeholder-user-id' ? await getEventsByUserId(userId) : [];

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No events yet.</p>
        <Link
          href="/create"
          className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
        >
          Create your first event
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Events</h2>
      <div className="grid gap-4">
        {events.map(async (event) => {
          const stats = await getRsvpStatsForEvent(event.id);
          const isUpcoming = new Date(event.starts_at) > new Date();
          const adminUrl = `/admin/${event.admin_secret}`;

          return (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isUpcoming
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {isUpcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {new Date(event.starts_at).toLocaleString()}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">
                        {stats.yes}
                      </span>{' '}
                      Yes
                    </div>
                    <div>
                      <span className="font-medium text-yellow-700 dark:text-yellow-300">
                        {stats.maybe}
                      </span>{' '}
                      Maybe
                    </div>
                    <div>
                      <span className="font-medium text-red-700 dark:text-red-300">
                        {stats.no}
                      </span>{' '}
                      No
                    </div>
                    <div className="ml-auto">
                      <span className="font-medium">{stats.total}</span> Total RSVPs
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/e/${event.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  View Public Page
                </Link>
                <Link
                  href={adminUrl}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:opacity-90"
                >
                  Manage Event
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

