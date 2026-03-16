import { notFound } from 'next/navigation';
import { getEventByAdminSecret } from '@/lib/db/events';
import { getRsvpsForEvent, getRsvpStatsForEvent } from '@/lib/db/rsvps';
import { getUserFromSession } from '@/lib/auth/user';
import { canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';
import AdminEventView from '@/components/AdminEventView';
import RecordManageView from '@/components/RecordManageView';

interface PageProps {
  params: Promise<{ adminSecret: string }>;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManagePage({ params }: PageProps) {
  const { adminSecret } = await params;
  const event = await getEventByAdminSecret(adminSecret);

  if (!event) {
    notFound();
  }

  const [rsvps, stats, user] = await Promise.all([
    getRsvpsForEvent(event.id),
    getRsvpStatsForEvent(event.id),
    getUserFromSession(),
  ]);

  // Pass user if they own or can claim this event (Organizer Hub benefits apply)
  const effectiveUser =
    user && (canManageEvent(user, event) || canClaimEvent(user, event)) ? user : null;

  return (
    <>
      <RecordManageView eventId={event.id} adminSecret={adminSecret} />
      <AdminEventView
        event={event}
        rsvps={rsvps}
        stats={stats}
        adminSecret={adminSecret}
        user={effectiveUser}
      />
    </>
  );
}
