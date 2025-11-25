import { NextRequest, NextResponse } from 'next/server';
import { updateEvent } from '@/lib/db/events';
import { updateEventSchema } from '@/lib/validations/event';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const body = await request.json();

    const { admin_secret, ...updateData } = body;

    if (!admin_secret) {
      return NextResponse.json({ error: 'Admin secret required' }, { status: 401 });
    }

    // Validate input
    const validationResult = updateEventSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // If date/time provided, combine them
    let startsAt: string | undefined = undefined;
    if (validatedData.date && validatedData.time) {
      startsAt = new Date(`${validatedData.date}T${validatedData.time}`).toISOString();
    } else if (validatedData.date || validatedData.time) {
      // Need both date and time
      return NextResponse.json(
        { error: 'Both date and time are required when updating' },
        { status: 400 }
      );
    }

    // Update event
    const event = await updateEvent(
      eventId,
      {
        ...validatedData,
        starts_at: startsAt,
      },
      admin_secret
    );

    // Don't expose admin_secret in response
    const { admin_secret: _, ...publicEvent } = event;

    return NextResponse.json({ success: true, event: publicEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    );
  }
}

