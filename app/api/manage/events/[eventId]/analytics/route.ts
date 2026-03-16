import { NextRequest, NextResponse } from 'next/server';
import { getEventByAdminSecret } from '@/lib/db/events';
import { getEventAnalytics } from '@/lib/db/analytics';
import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature, canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const adminSecret = request.nextUrl.searchParams.get('admin_secret');

    if (!adminSecret) {
      return NextResponse.json({ error: 'admin_secret required' }, { status: 401 });
    }

    const event = await getEventByAdminSecret(adminSecret);
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Invalid manage link' }, { status: 403 });
    }

    const user = await getUserFromSession();
    const effectiveUser =
      user && (canManageEvent(user, event) || canClaimEvent(user, event)) ? user : null;

    if (!canUseFeature(effectiveUser, event, 'analytics')) {
      return NextResponse.json({ error: 'Analytics not available for this plan' }, { status: 403 });
    }

    const days = request.nextUrl.searchParams.get('days');
    const daysNum = days ? parseInt(days, 10) : undefined;

    const summary = await getEventAnalytics(eventId, daysNum);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    );
  }
}
