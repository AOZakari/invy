import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/db/events';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Don't expose admin_secret in public API
    const { admin_secret, ...publicEvent } = event;

    return NextResponse.json(publicEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

