import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getUserFromSession } from '@/lib/auth/user';
import { getEventById } from '@/lib/db/events';
import { claimEvent } from '@/lib/db/events';
import { canClaimEvent } from '@/lib/permissions/capabilities';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify user can claim this event
    if (!canClaimEvent(user, event)) {
      return NextResponse.json(
        { error: 'You cannot claim this event' },
        { status: 403 }
      );
    }

    // Claim the event
    const updatedEvent = await claimEvent(eventId, user.id);

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error claiming event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim event' },
      { status: 500 }
    );
  }
}

