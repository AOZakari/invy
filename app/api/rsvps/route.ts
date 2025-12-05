import { NextRequest, NextResponse } from 'next/server';
import { createRsvp } from '@/lib/db/rsvps';
import { getEventById } from '@/lib/db/events';
import { sendOrganizerRsvpEmail, sendRsvpConfirmationEmail } from '@/lib/emails/resend';
import { createRsvpSchema } from '@/lib/validations/rsvp';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { event_id, ...rsvpData } = body;

    if (!event_id || typeof event_id !== 'string') {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    // Validate input
    const validationResult = createRsvpSchema.safeParse(rsvpData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create RSVP
    const rsvp = await createRsvp(event_id, {
      name: data.name,
      contact_info: data.contact_info,
      status: data.status,
      plus_one: data.plus_one,
    });

    const event = await getEventById(event_id);

    const contactInfo = data.contact_info.trim();
    if (EMAIL_REGEX.test(contactInfo) && event) {
      try {
        await sendRsvpConfirmationEmail({
          guestEmail: contactInfo,
          guestName: data.name,
          eventTitle: event.title,
          eventDate: event.starts_at,
          eventLocation: event.location_text,
          eventUrl: `${APP_URL}/e/${event.slug}`,
          eventId: event.id,
        });
      } catch (emailError) {
        console.error('Failed to send RSVP confirmation email:', emailError);
      }
    }

    if (event?.notify_on_rsvp) {
      try {
        await sendOrganizerRsvpEmail({
          organizerEmail: event.organizer_email,
          eventTitle: event.title,
          guestName: data.name,
          guestStatus: data.status,
          guestContact: contactInfo,
          guestPlusOne: data.plus_one || 0,
          manageUrl: `${APP_URL}/manage/${event.admin_secret}`,
          publicUrl: `${APP_URL}/e/${event.slug}`,
          eventId: event.id,
        });
      } catch (emailError) {
        console.error('Failed to send organizer RSVP email:', emailError);
      }
    }

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}

