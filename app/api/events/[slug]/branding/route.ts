import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/db/events';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/** Returns branding info for an event (used by Footer to hide "Powered by INVY") */
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ hideBranding: false });
  }
  return NextResponse.json({ hideBranding: !!event.hide_branding });
}
