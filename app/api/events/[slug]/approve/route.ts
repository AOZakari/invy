import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/utils/approval-token';
import { getEventBySlug } from '@/lib/db/events';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/** Verify approval token and set cookie, then redirect to event page */
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/e/${slug}`);
  }

  const decoded = verifyApprovalToken(token);
  if (!decoded) {
    return NextResponse.redirect(`${APP_URL}/e/${slug}`);
  }

  const event = await getEventBySlug(slug);
  if (!event || event.id !== decoded.eventId) {
    return NextResponse.redirect(`${APP_URL}/e/${slug}`);
  }

  const response = NextResponse.redirect(`${APP_URL}/e/${slug}`);
  const existing = request.cookies.get('invy_approved')?.value || '';
  const ids = new Set(existing ? existing.split(',') : []);
  ids.add(decoded.eventId);
  response.cookies.set('invy_approved', [...ids].join(','), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    httpOnly: false,
  });

  return response;
}
