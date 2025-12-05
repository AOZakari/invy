import { notFound, redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth/user';
import { getEventById } from '@/lib/db/events';
import { getRsvpsForEvent, getRsvpStatsForEvent } from '@/lib/db/rsvps';
import { canManageEvent } from '@/lib/permissions/capabilities';
import AdminEventView from '@/components/AdminEventView';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function DashboardEventPage({ params }: PageProps) {
  const { eventId } = await params;
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  const event = await getEventById(eventId);
  if (!event) {
    notFound();
  }

  // Verify user owns this event or is super-admin
  if (!canManageEvent(user, event)) {
    redirect('/dashboard');
  }

  const [rsvps, stats] = await Promise.all([
    getRsvpsForEvent(event.id),
    getRsvpStatsForEvent(event.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/events"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to events
        </Link>
      </div>
      <AdminEventView
        event={event}
        rsvps={rsvps}
        stats={stats}
        adminSecret={event.admin_secret}
      />
    </div>
  );
}

