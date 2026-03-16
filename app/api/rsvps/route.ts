import { NextRequest, NextResponse } from 'next/server';
import { createRsvp } from '@/lib/db/rsvps';
import { createRsvpWithCapacityCheck } from '@/lib/db/capacity';
import { getEventById } from '@/lib/db/events';
import { recordAnalytics } from '@/lib/db/analytics';
import { sendOrganizerRsvpEmail, sendRsvpConfirmationEmail, sendRequestReceivedEmail } from '@/lib/emails/resend';
import { createRsvpSchema } from '@/lib/validations/rsvp';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    const event = await getEventById(event_id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const customFields = (event.custom_rsvp_fields || []) as { id: string; label: string; type: string; required?: boolean; options?: string[] }[];
    const customValues: Record<string, string | number | boolean> = {};
    if (data.custom_field_values && customFields.length > 0) {
      for (const field of customFields) {
        const val = data.custom_field_values[field.id];
        if (field.required && (val === undefined || val === '')) {
          return NextResponse.json({ error: `${field.label} is required` }, { status: 400 });
        }
        if (val !== undefined && val !== '') {
          customValues[field.id] = val as string | number | boolean;
        }
      }
    }

    const name = (data.name ?? '').trim();
    const rsvpMode = (event as any).rsvp_mode || 'instant';
    const isRequestMode = rsvpMode === 'request';

    const status = isRequestMode ? 'pending' : data.status;

    // Atomic capacity enforcement for instant RSVP (request-mode pending does not consume spots)
    const capacityLimit = event.capacity_limit;
    const useAtomicCreate =
      capacityLimit != null &&
      capacityLimit > 0 &&
      !isRequestMode &&
      (status === 'yes' || status === 'maybe');

    let rsvp;
    if (useAtomicCreate) {
      try {
        rsvp = await createRsvpWithCapacityCheck(event_id, {
          name: name || '',
          contact_info: data.contact_info,
          status,
          plus_one: data.plus_one,
          custom_field_values: customValues,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create RSVP';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    } else {
      rsvp = await createRsvp(event_id, {
        name: name || '',
        contact_info: data.contact_info,
        status,
        plus_one: data.plus_one,
        custom_fields: customValues,
      });
    }

    try {
      await recordAnalytics(event_id, 'rsvp');
    } catch (analyticsErr) {
      console.error('Failed to record RSVP analytics:', analyticsErr);
    }

    const contactInfo = data.contact_info.trim();
    if (event) {
      try {
        if (isRequestMode) {
          await sendRequestReceivedEmail({
            guestEmail: contactInfo,
            guestName: name || 'Guest',
            eventTitle: event.title,
            eventId: event.id,
            hideBranding: event.hide_branding,
          });
        } else {
          await sendRsvpConfirmationEmail({
            guestEmail: contactInfo,
            guestName: name || 'Guest',
            eventTitle: event.title,
            eventDate: event.starts_at,
            eventLocation: event.location_text,
            eventUrl: `${APP_URL}/e/${event.slug}`,
            eventId: event.id,
            hideBranding: event.hide_branding,
          });
        }
      } catch (emailError) {
        console.error('Failed to send guest email:', emailError);
      }
    }

    if (event?.notify_on_rsvp) {
      try {
        await sendOrganizerRsvpEmail({
          organizerEmail: event.organizer_email,
          eventTitle: event.title,
          guestName: name || '—',
          guestStatus: isRequestMode ? 'pending' : data.status,
          guestContact: contactInfo,
          guestPlusOne: data.plus_one || 0,
          manageUrl: `${APP_URL}/manage/${event.admin_secret}`,
          publicUrl: `${APP_URL}/e/${event.slug}`,
          eventId: event.id,
          hideBranding: event.hide_branding,
        });
      } catch (emailError) {
        console.error('Failed to send organizer RSVP email:', emailError);
      }
    }

    const response = NextResponse.json({ success: true, rsvp });

    // Set cookie for attendees_only guest list (append event ID)
    const existing = request.cookies.get('invy_rsvp')?.value || '';
    const ids = new Set(existing ? existing.split(',') : []);
    ids.add(event_id);
    response.cookies.set('invy_rsvp', [...ids].join(','), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow client to read if needed
    });

    return response;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}

