import { NextRequest, NextResponse } from 'next/server';
import { createEvent } from '@/lib/db/events';
import { sendEventCreatedEmail } from '@/lib/emails/resend';
import { createEventSchema } from '@/lib/validations/event';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Combine date and time into ISO timestamp
    const dateTimeString = `${data.date}T${data.time}`;
    const startsAt = new Date(dateTimeString).toISOString();

    // Create event
    const event = await createEvent({
      title: data.title,
      description: data.description,
      starts_at: startsAt,
      location_text: data.location_text,
      location_url: data.location_url || undefined,
      organizer_email: data.organizer_email,
      theme: data.theme,
      notify_on_rsvp: data.notify_on_rsvp,
    });

    // Generate URLs
    const publicUrl = `${APP_URL}/e/${event.slug}`;
    const manageUrl = `${APP_URL}/manage/${event.admin_secret}`;

    // Send email (don't fail if email fails)
    try {
      await sendEventCreatedEmail({
        organizerEmail: event.organizer_email,
        eventTitle: event.title,
        publicUrl,
        manageUrl,
        eventId: event.id,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }

    // Return success (admin_secret is included for redirect, but should not be exposed in public APIs later)
    return NextResponse.json({
      slug: event.slug,
      adminSecret: event.admin_secret,
      publicUrl,
      manageUrl,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    );
  }
}

