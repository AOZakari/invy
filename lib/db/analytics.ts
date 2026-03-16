import { supabaseAdmin } from '@/lib/supabase/server';

export type AnalyticsMetricType = 'page_view' | 'rsvp' | 'manage_open';

/**
 * Record an analytics event (increments count for today)
 */
export async function recordAnalytics(
  eventId: string,
  metricType: AnalyticsMetricType
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: existing } = await supabaseAdmin
    .from('event_analytics')
    .select('id, count')
    .eq('event_id', eventId)
    .eq('metric_type', metricType)
    .eq('date', today)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('event_analytics')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin.from('event_analytics').insert({
      event_id: eventId,
      metric_type: metricType,
      date: today,
      count: 1,
    });
  }
}

export interface EventAnalyticsSummary {
  page_views: number;
  rsvps: number;
  manage_opens: number;
}

/**
 * Get analytics summary for an event (all time or last N days)
 */
export async function getEventAnalytics(
  eventId: string,
  days?: number
): Promise<EventAnalyticsSummary> {
  let query = supabaseAdmin
    .from('event_analytics')
    .select('metric_type, count')
    .eq('event_id', eventId);

  if (days != null && days > 0) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);
    query = query.gte('date', sinceStr);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  const summary: EventAnalyticsSummary = {
    page_views: 0,
    rsvps: 0,
    manage_opens: 0,
  };

  const keyMap: Record<string, keyof EventAnalyticsSummary> = {
    page_view: 'page_views',
    rsvp: 'rsvps',
    manage_open: 'manage_opens',
  };

  for (const row of data || []) {
    const key = keyMap[row.metric_type];
    if (key) {
      summary[key] += row.count ?? 0;
    }
  }

  return summary;
}
