import { NextRequest, NextResponse } from 'next/server';
import { createRsvp } from '@/lib/db/rsvps';
import { createRsvpSchema } from '@/lib/validations/rsvp';

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

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}

