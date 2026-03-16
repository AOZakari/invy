import { NextRequest, NextResponse } from 'next/server';
import { recordAnalytics, type AnalyticsMetricType } from '@/lib/db/analytics';
import { getEventById, getEventByAdminSecret } from '@/lib/db/events';

const VALID_METRICS: AnalyticsMetricType[] = ['page_view', 'rsvp', 'manage_open'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { event_id, metric_type, admin_secret } = body;

    if (!event_id || typeof event_id !== 'string') {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    if (!metric_type || !VALID_METRICS.includes(metric_type)) {
      return NextResponse.json({ error: 'Invalid metric_type' }, { status: 400 });
    }

    const event = await getEventById(event_id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // manage_open requires admin_secret verification
    if (metric_type === 'manage_open') {
      if (!admin_secret) {
        return NextResponse.json({ error: 'admin_secret required for manage_open' }, { status: 401 });
      }
      const managed = await getEventByAdminSecret(admin_secret);
      if (!managed || managed.id !== event_id) {
        return NextResponse.json({ error: 'Invalid manage link' }, { status: 403 });
      }
    }

    await recordAnalytics(event_id, metric_type);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics record error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record' },
      { status: 500 }
    );
  }
}
