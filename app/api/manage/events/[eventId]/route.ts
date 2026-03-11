import { NextRequest, NextResponse } from 'next/server';
import { updateEvent, deleteEvent } from '@/lib/db/events';
import { updateEventSchema } from '@/lib/validations/event';
import type { UpdateEventInput } from '@/types/database';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

function buildUpdatePayload(validatedData: {
  date?: string;
  time?: string;
  end_time?: string;
  rsvp_deadline_date?: string;
  rsvp_deadline_time?: string;
  title?: string;
  description?: string;
  location_text?: string;
  location_url?: string;
  theme?: 'light' | 'dark';
  notify_on_rsvp?: boolean;
  capacity_limit?: number | null;
  rsvp_open?: boolean;
}): UpdateEventInput | null {
  let starts_at: string | undefined;
  if (validatedData.date && validatedData.time) {
    starts_at = new Date(`${validatedData.date}T${validatedData.time}`).toISOString();
  } else if (validatedData.date || validatedData.time) {
    return null;
  }

  let ends_at: string | null | undefined;
  if (validatedData.end_time?.trim() && validatedData.date) {
    ends_at = new Date(`${validatedData.date}T${validatedData.end_time}`).toISOString();
  }

  let rsvp_deadline: string | null | undefined;
  if (validatedData.rsvp_deadline_date?.trim()) {
    const t = validatedData.rsvp_deadline_time?.trim() || '23:59';
    rsvp_deadline = new Date(`${validatedData.rsvp_deadline_date}T${t}`).toISOString();
  }

  const payload: UpdateEventInput = {};
  if (validatedData.title !== undefined) payload.title = validatedData.title;
  if (validatedData.description !== undefined) payload.description = validatedData.description;
  if (starts_at !== undefined) payload.starts_at = starts_at;
  if (ends_at !== undefined) payload.ends_at = ends_at;
  if (validatedData.location_text !== undefined) payload.location_text = validatedData.location_text;
  if (validatedData.location_url !== undefined) payload.location_url = validatedData.location_url;
  if (validatedData.theme !== undefined) payload.theme = validatedData.theme;
  if (validatedData.notify_on_rsvp !== undefined) payload.notify_on_rsvp = validatedData.notify_on_rsvp;
  if (validatedData.capacity_limit !== undefined) payload.capacity_limit = validatedData.capacity_limit;
  if (rsvp_deadline !== undefined) payload.rsvp_deadline = rsvp_deadline;
  if (validatedData.rsvp_open !== undefined) payload.rsvp_open = validatedData.rsvp_open;

  return payload;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const body = await request.json();

    const { admin_secret, ...updateData } = body;

    if (!admin_secret) {
      return NextResponse.json({ error: 'Manage secret required' }, { status: 401 });
    }

    const validationResult = updateEventSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const payload = buildUpdatePayload(validatedData);
    if (payload === null) {
      return NextResponse.json(
        { error: 'Both date and time are required when updating' },
        { status: 400 }
      );
    }

    const event = await updateEvent(eventId, payload, admin_secret);

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const admin_secret = body.admin_secret || request.nextUrl.searchParams.get('admin_secret');

    if (!admin_secret) {
      return NextResponse.json({ error: 'Manage secret required' }, { status: 401 });
    }

    await deleteEvent(eventId, admin_secret);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 500 }
    );
  }
}

