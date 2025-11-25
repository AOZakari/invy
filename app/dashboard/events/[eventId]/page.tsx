import { notFound } from 'next/navigation';
import { getEventByAdminSecret } from '@/lib/db/events';
import { getRsvpsForEvent, getRsvpStatsForEvent } from '@/lib/db/rsvps';
import AdminEventView from '@/components/AdminEventView';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function DashboardEventPage({ params }: PageProps) {
  const { eventId } = await params;

  // TODO: Verify user owns this event
  // For now, this is a placeholder that would need the admin secret
  // In a real implementation, you'd fetch by eventId and verify ownership

  return (
    <div>
      <p>Event detail page - Phase 6+ (requires auth to be fully implemented)</p>
      <p>Event ID: {eventId}</p>
    </div>
  );
}

