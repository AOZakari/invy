'use client';

import { useState, useEffect } from 'react';

interface AnalyticsSummary {
  page_views: number;
  rsvps: number;
  manage_opens: number;
}

interface AnalyticsWidgetProps {
  eventId: string;
  adminSecret: string;
}

export default function AnalyticsWidget({ eventId, adminSecret }: AnalyticsWidgetProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `/api/manage/events/${eventId}/analytics?admin_secret=${encodeURIComponent(adminSecret)}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.page_views !== undefined) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId, adminSecret]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Analytics</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xl font-bold">{data.page_views}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Page views</div>
        </div>
        <div>
          <div className="text-xl font-bold">{data.rsvps}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">RSVP submissions</div>
        </div>
        <div>
          <div className="text-xl font-bold">{data.manage_opens}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Manage link opens</div>
        </div>
      </div>
    </div>
  );
}
