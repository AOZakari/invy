import { supabaseAdmin } from '@/lib/supabase/server';
import type { RSVP } from '@/types/database';
import Link from 'next/link';

async function getRsvps() {
  // First get RSVPs
  const { data: rsvps, error: rsvpsError } = await supabaseAdmin
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (rsvpsError) {
    throw new Error(`Failed to fetch RSVPs: ${rsvpsError.message}`);
  }

  if (!rsvps || rsvps.length === 0) {
    return [];
  }

  // Get unique event IDs
  const eventIds = [...new Set(rsvps.map((r) => r.event_id))];

  // Fetch events
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('id, title, slug')
    .in('id', eventIds);

  if (eventsError) {
    throw new Error(`Failed to fetch events: ${eventsError.message}`);
  }

  // Map events to RSVPs
  const eventMap = new Map((events || []).map((e) => [e.id, e]));

  return (rsvps || []).map((rsvp) => ({
    ...rsvp,
    event: eventMap.get(rsvp.event_id) || { title: 'Unknown Event', slug: '' },
  })) as (RSVP & { event: { title: string; slug: string } })[];
}

export default async function AdminRsvpsPage() {
  const rsvps = await getRsvps();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">RSVPs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all RSVPs across all events
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Contact</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">+1</th>
                <th className="text-left py-3 px-4 font-medium">Event</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr
                  key={rsvp.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 font-medium">{rsvp.name}</td>
                  <td className="py-3 px-4">{rsvp.contact_info}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        rsvp.status === 'yes'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : rsvp.status === 'maybe'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {rsvp.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">{rsvp.plus_one > 0 ? `+${rsvp.plus_one}` : '-'}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/e/${rsvp.event.slug}`}
                      target="_blank"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {rsvp.event.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(rsvp.created_at).toLocaleDateString()}
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

