'use client';

import { useEffect } from 'react';

export default function RecordManageView({
  eventId,
  adminSecret,
}: {
  eventId: string;
  adminSecret: string;
}) {
  useEffect(() => {
    fetch('/api/analytics/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        metric_type: 'manage_open',
        admin_secret: adminSecret,
      }),
    }).catch(() => {});
  }, [eventId, adminSecret]);

  return null;
}
