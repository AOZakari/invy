'use client';

import { useEffect } from 'react';

export default function RecordPageView({ eventId }: { eventId: string }) {
  useEffect(() => {
    fetch('/api/analytics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, metric_type: 'page_view' }),
    }).catch(() => {});
  }, [eventId]);

  return null;
}
