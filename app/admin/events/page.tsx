import { supabaseAdmin } from '@/lib/supabase/server';
import type { Event } from '@/types/database';
import Link from 'next/link';

async function getEvents() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return (data || []) as Event[];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all events
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Slug</th>
                <th className="text-left py-3 px-4 font-medium">Organizer</th>
                <th className="text-left py-3 px-4 font-medium">Plan</th>
                <th className="text-left py-3 px-4 font-medium">Owner</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 font-medium">{event.title}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/e/${event.slug}`}
                      target="_blank"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {event.slug}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{event.organizer_email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.plan_tier === 'free'
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : event.plan_tier === 'pro'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}
                    >
                      {event.plan_tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {event.owner_user_id ? (
                      <span className="text-green-600 dark:text-green-400">Claimed</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Unclaimed</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(event.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

