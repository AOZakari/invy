import { NextRequest, NextResponse } from 'next/server';
import { updateEvent, deleteEvent, getEventByAdminSecret } from '@/lib/db/events';
import { getRsvpsForEvent } from '@/lib/db/rsvps';
import { getExactOccupancy } from '@/lib/db/capacity';
import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature, canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';
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
  theme?: 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'lavender';
  notify_on_rsvp?: boolean;
  capacity_limit?: number | null;
  rsvp_open?: boolean;
  guest_list_visibility?: 'host_only' | 'public' | 'attendees_only';
  slug?: string;
  og_image_url?: string | null;
  page_style?: 'classic' | 'modern' | 'bold';
  cover_image_url?: string | null;
  poster_image_url?: string | null;
  cover_image_position?: 'top' | 'center' | 'bottom';
  custom_rsvp_fields?: { id: string; label: string; type: string; required?: boolean; options?: string[] }[];
  custom_share_message?: string | null;
  hide_branding_in_share?: boolean;
  send_reminder_1_day?: boolean;
  hide_branding?: boolean;
  rsvp_mode?: 'instant' | 'request';
  hide_location_until_approved?: boolean;
  hide_private_note_until_approved?: boolean;
  private_note?: string | null;
  show_organizer_contact?: boolean;
  organizer_contact_email?: string | null;
  organizer_contact_phone?: string | null;
  organizer_contact_instagram?: string | null;
  organizer_contact_whatsapp?: string | null;
  organizer_contact_text?: string | null;
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
  if (validatedData.guest_list_visibility !== undefined) payload.guest_list_visibility = validatedData.guest_list_visibility;
  if (validatedData.slug !== undefined && validatedData.slug !== '') payload.slug = validatedData.slug.trim().toLowerCase();
  if (validatedData.og_image_url !== undefined) payload.og_image_url = validatedData.og_image_url?.trim() || null;
  if (validatedData.page_style !== undefined) payload.page_style = validatedData.page_style;
  if (validatedData.cover_image_url !== undefined) payload.cover_image_url = validatedData.cover_image_url?.trim() || null;
  if (validatedData.poster_image_url !== undefined) payload.poster_image_url = validatedData.poster_image_url?.trim() || null;
  if (validatedData.cover_image_position !== undefined) payload.cover_image_position = validatedData.cover_image_position;
  if (validatedData.custom_rsvp_fields !== undefined) payload.custom_rsvp_fields = validatedData.custom_rsvp_fields as UpdateEventInput['custom_rsvp_fields'];
  if (validatedData.custom_share_message !== undefined) payload.custom_share_message = validatedData.custom_share_message ?? null;
  if (validatedData.hide_branding_in_share !== undefined) payload.hide_branding_in_share = validatedData.hide_branding_in_share;
  if (validatedData.send_reminder_1_day !== undefined) payload.send_reminder_1_day = validatedData.send_reminder_1_day;
  if (validatedData.hide_branding !== undefined) payload.hide_branding = validatedData.hide_branding;
  if (validatedData.rsvp_mode !== undefined) payload.rsvp_mode = validatedData.rsvp_mode;
  if (validatedData.hide_location_until_approved !== undefined) payload.hide_location_until_approved = validatedData.hide_location_until_approved;
  if (validatedData.hide_private_note_until_approved !== undefined) payload.hide_private_note_until_approved = validatedData.hide_private_note_until_approved;
  if (validatedData.private_note !== undefined) payload.private_note = validatedData.private_note ?? null;
  if (validatedData.show_organizer_contact !== undefined) payload.show_organizer_contact = validatedData.show_organizer_contact;
  if (validatedData.organizer_contact_email !== undefined) payload.organizer_contact_email = validatedData.organizer_contact_email?.trim() || null;
  if (validatedData.organizer_contact_phone !== undefined) payload.organizer_contact_phone = validatedData.organizer_contact_phone?.trim() || null;
  if (validatedData.organizer_contact_instagram !== undefined) payload.organizer_contact_instagram = validatedData.organizer_contact_instagram?.trim() || null;
  if (validatedData.organizer_contact_whatsapp !== undefined) payload.organizer_contact_whatsapp = validatedData.organizer_contact_whatsapp?.trim() || null;
  if (validatedData.organizer_contact_text !== undefined) payload.organizer_contact_text = validatedData.organizer_contact_text?.trim() || null;

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

    const existingEvent = await getEventByAdminSecret(admin_secret);
    if (!existingEvent || existingEvent.id !== eventId) {
      return NextResponse.json({ error: 'Invalid manage link' }, { status: 403 });
    }

    const user = await getUserFromSession();
    const effectiveUser =
      user && (canManageEvent(user, existingEvent) || canClaimEvent(user, existingEvent))
        ? user
        : null;

    if (payload.capacity_limit !== undefined && !canUseFeature(effectiveUser, existingEvent, 'capacity_limits')) {
      delete payload.capacity_limit;
    }

    // Prevent lowering capacity below current occupancy (would create inconsistency)
    if (payload.capacity_limit !== undefined && payload.capacity_limit != null && payload.capacity_limit > 0) {
      const rsvps = await getRsvpsForEvent(eventId);
      const occupancy = getExactOccupancy(rsvps);
      if (occupancy > payload.capacity_limit) {
        return NextResponse.json(
          { error: `Cannot set capacity to ${payload.capacity_limit}: ${Math.ceil(occupancy)} spots are already taken.` },
          { status: 400 }
        );
      }
    }

    if (payload.slug !== undefined && !canUseFeature(effectiveUser, existingEvent, 'custom_slug')) {
      delete payload.slug;
    }

    if (payload.og_image_url !== undefined && !canUseFeature(effectiveUser, existingEvent, 'link_preview_cards')) {
      delete payload.og_image_url;
    }

    if (payload.page_style !== undefined && !canUseFeature(effectiveUser, existingEvent, 'page_style')) {
      delete payload.page_style;
    }

    if (payload.cover_image_url !== undefined && !canUseFeature(effectiveUser, existingEvent, 'cover_image')) {
      delete payload.cover_image_url;
    }

    if (payload.poster_image_url !== undefined && !canUseFeature(effectiveUser, existingEvent, 'poster_image')) {
      delete payload.poster_image_url;
    }

    if (payload.cover_image_position !== undefined && !canUseFeature(effectiveUser, existingEvent, 'cover_image')) {
      delete payload.cover_image_position;
    }

    if (payload.guest_list_visibility !== undefined && !canUseFeature(effectiveUser, existingEvent, 'guest_list_controls')) {
      delete payload.guest_list_visibility;
    }

    if (payload.custom_rsvp_fields !== undefined) {
      if (!canUseFeature(effectiveUser, existingEvent, 'custom_rsvp_fields')) {
        delete payload.custom_rsvp_fields;
      } else if (existingEvent.keep_live && payload.custom_rsvp_fields.length > 1) {
        payload.custom_rsvp_fields = payload.custom_rsvp_fields.slice(0, 1);
      }
    }

    if ((payload.custom_share_message !== undefined || payload.hide_branding_in_share !== undefined) && !canUseFeature(effectiveUser, existingEvent, 'share_controls')) {
      delete payload.custom_share_message;
      delete payload.hide_branding_in_share;
    }

    if (payload.send_reminder_1_day !== undefined && !canUseFeature(effectiveUser, existingEvent, 'email_reminders')) {
      delete payload.send_reminder_1_day;
    }

    if (payload.hide_branding !== undefined && !canUseFeature(effectiveUser, existingEvent, 'white_label')) {
      delete payload.hide_branding;
    }

    if (payload.rsvp_mode !== undefined && !canUseFeature(effectiveUser, existingEvent, 'request_to_attend')) {
      delete payload.rsvp_mode;
    }

    if (payload.hide_location_until_approved !== undefined && !canUseFeature(effectiveUser, existingEvent, 'request_to_attend')) {
      delete payload.hide_location_until_approved;
    }

    if (payload.hide_private_note_until_approved !== undefined && !canUseFeature(effectiveUser, existingEvent, 'request_to_attend')) {
      delete payload.hide_private_note_until_approved;
    }

    if (payload.private_note !== undefined && !canUseFeature(effectiveUser, existingEvent, 'request_to_attend')) {
      delete payload.private_note;
    }

    const hasOrganizerContactPayload =
      payload.show_organizer_contact !== undefined ||
      payload.organizer_contact_email !== undefined ||
      payload.organizer_contact_phone !== undefined ||
      payload.organizer_contact_instagram !== undefined ||
      payload.organizer_contact_whatsapp !== undefined ||
      payload.organizer_contact_text !== undefined;
    if (hasOrganizerContactPayload && !canUseFeature(effectiveUser, existingEvent, 'organizer_contact')) {
      delete payload.show_organizer_contact;
      delete payload.organizer_contact_email;
      delete payload.organizer_contact_phone;
      delete payload.organizer_contact_instagram;
      delete payload.organizer_contact_whatsapp;
      delete payload.organizer_contact_text;
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

