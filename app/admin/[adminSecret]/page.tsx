import { notFound } from 'next/navigation';
import { getEventByAdminSecret, updateEvent } from '@/lib/db/events';
import { getRsvpsForEvent, getRsvpStatsForEvent } from '@/lib/db/rsvps';
import AdminEventView from '@/components/AdminEventView';
import type { Event } from '@/types/database';

interface PageProps {
  params: Promise<{ adminSecret: string }>;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage({ params }: PageProps) {
  const { adminSecret } = await params;
  const event = await getEventByAdminSecret(adminSecret);

  if (!event) {
    notFound();
  }

  const [rsvps, stats] = await Promise.all([
    getRsvpsForEvent(event.id),
    getRsvpStatsForEvent(event.id),
  ]);

  return (
    <AdminEventView
      event={event}
      rsvps={rsvps}
      stats={stats}
      adminSecret={adminSecret}
    />
  );
}
