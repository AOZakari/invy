import { NextRequest, NextResponse } from 'next/server';
import { getEventsForReminders, markReminderSent } from '@/lib/db/events';
import { getRsvpsForEvent } from '@/lib/db/rsvps';
import { sendReminderEmail } from '@/lib/emails/resend';

const CRON_SECRET = process.env.CRON_SECRET;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Vercel cron or external scheduler calls this to send reminder emails */
export async function GET(request: NextRequest) {
  if (CRON_SECRET && request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

  try {
    const events = await getEventsForReminders();
    let sent = 0;

    for (const event of events) {
      const rsvps = await getRsvpsForEvent(event.id);
      const eventUrl = `${APP_URL}/e/${event.slug}`;
      const eventDate = formatDate(event.starts_at);
      const eventTime = formatTime(event.starts_at);

      for (const rsvp of rsvps) {
        // Include yes, maybe (instant), and approved (request-mode confirmed)
        if (rsvp.status !== 'yes' && rsvp.status !== 'maybe' && rsvp.status !== 'approved') continue;
        const email = rsvp.contact_info?.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;

        try {
          await sendReminderEmail({
            guestEmail: email,
            guestName: rsvp.name || 'Guest',
            eventTitle: event.title,
            eventDate,
            eventTime,
            eventLocation: event.location_text,
            eventUrl,
            eventId: event.id,
            hideBranding: event.hide_branding,
          });
          sent++;
        } catch (err) {
          console.error(`Reminder failed for ${email}:`, err);
        }
      }

      await markReminderSent(event.id);
    }

    return NextResponse.json({ success: true, events: events.length, emailsSent: sent });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
