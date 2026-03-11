import { NextRequest } from 'next/server';
import { getEventBySlug } from '@/lib/db/events';
import { generateICS } from '@/lib/utils/ics';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return new Response('Event not found', { status: 404 });
  }

  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : undefined;

  const ics = generateICS({
    title: event.title,
    description: event.description || undefined,
    start,
    end,
    location: event.location_text,
    locationUrl: event.location_url || undefined,
  });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  });
}
