import { NextRequest, NextResponse } from 'next/server';
import { duplicateEvent } from '@/lib/db/events';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const admin_secret = body.admin_secret;

    if (!admin_secret) {
      return NextResponse.json({ error: 'Manage secret required' }, { status: 401 });
    }

    const newEvent = await duplicateEvent(eventId, admin_secret);

    return NextResponse.json({
      success: true,
      slug: newEvent.slug,
      adminSecret: newEvent.admin_secret,
    });
  } catch (error) {
    console.error('Error duplicating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to duplicate event' },
      { status: 500 }
    );
  }
}
