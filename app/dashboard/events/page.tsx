import { getUserFromSession } from '@/lib/auth/user';
import { getEventsByUserId } from '@/lib/db/events';
import { getRsvpStatsForEvent } from '@/lib/db/rsvps';
import Link from 'next/link';

export default async function EventsPage() {
  const user = await getUserFromSession();
  if (!user) {
    return null;
  }

  const events = await getEventsByUserId(user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Events</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and view all your events
          </p>
        </div>
        <Link
          href="/create"
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No events yet.</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(async (event) => {
            const stats = await getRsvpStatsForEvent(event.id);
            const isUpcoming = new Date(event.starts_at) > new Date();

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
                      {event.plan_tier !== 'free' && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {event.plan_tier.toUpperCase()}
                        </span>
                      )}
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
                    href={`/dashboard/events/${event.id}`}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:opacity-90"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

