import { NextRequest, NextResponse } from 'next/server';
import { getEventByAdminSecret } from '@/lib/db/events';
import { getRsvpsForEvent, updateRsvpStatus } from '@/lib/db/rsvps';
import { approveRsvpsWithCapacityCheck } from '@/lib/db/capacity';
import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature, canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';
import { sendRequestApprovedEmail, sendRequestDeclinedEmail } from '@/lib/emails/resend';
import { createApprovalToken } from '@/lib/utils/approval-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

interface RouteContext {
  params: Promise<{ eventId: string; rsvpId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { eventId, rsvpId } = await context.params;
    const body = await request.json();

    const { admin_secret, status } = body;

    if (!admin_secret || !status) {
      return NextResponse.json(
        { error: 'admin_secret and status (approved|declined) required' },
        { status: 400 }
      );
    }

    if (!['approved', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'status must be approved or declined' }, { status: 400 });
    }

    const event = await getEventByAdminSecret(admin_secret);
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Invalid manage link' }, { status: 403 });
    }

    const user = await getUserFromSession();
    const effectiveUser =
      user && (canManageEvent(user, event) || canClaimEvent(user, event)) ? user : null;

    if (!canUseFeature(effectiveUser, event, 'request_to_attend')) {
      return NextResponse.json({ error: 'Request-to-attend not available' }, { status: 403 });
    }

    const rsvps = await getRsvpsForEvent(eventId);
    const rsvp = rsvps.find((r) => r.id === rsvpId);
    if (!rsvp || rsvp.status !== 'pending') {
      return NextResponse.json({ error: 'RSVP not found or not pending' }, { status: 404 });
    }

    // Atomic capacity check for approve; plain update when no capacity
    const hasCapacity = event.capacity_limit != null && event.capacity_limit > 0;
    let updated;
    if (hasCapacity) {
      try {
        await approveRsvpsWithCapacityCheck(admin_secret, eventId, [rsvpId], status);
        updated = { ...rsvp, status };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Update failed';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    } else {
      updated = await updateRsvpStatus(rsvpId, status);
    }

    // Send email
    const guestEmail = rsvp.contact_info?.trim();
    const guestName = rsvp.name || 'Guest';
    if (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      try {
        if (status === 'approved') {
          const approvalToken = (event.hide_location_until_approved || event.hide_private_note_until_approved)
            ? createApprovalToken(event.id, guestEmail)
            : undefined;
          await sendRequestApprovedEmail({
            guestEmail,
            guestName,
            eventTitle: event.title,
            eventDate: event.starts_at,
            eventLocation: event.location_text,
            eventUrl: `${APP_URL}/e/${event.slug}`,
            eventId: event.id,
            eventSlug: event.slug,
            hideBranding: event.hide_branding,
            privateNote: event.hide_private_note_until_approved ? event.private_note : null,
            approvalToken,
          });
        } else {
          await sendRequestDeclinedEmail({
            guestEmail,
            guestName,
            eventTitle: event.title,
            eventId: event.id,
            hideBranding: event.hide_branding,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send approval/decline email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, rsvp: updated });
  } catch (error) {
    console.error('RSVP status update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}
