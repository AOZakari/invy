import { NextRequest, NextResponse } from 'next/server';
import { getEventByAdminSecret } from '@/lib/db/events';
import { getRsvpsForEvent, bulkUpdateRsvpStatus } from '@/lib/db/rsvps';
import { approveRsvpsWithCapacityCheck } from '@/lib/db/capacity';
import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature, canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';
import { sendRequestApprovedEmail, sendRequestDeclinedEmail } from '@/lib/emails/resend';
import { createApprovalToken } from '@/lib/utils/approval-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const body = await request.json();

    const { admin_secret, rsvp_ids, action } = body;

    if (!admin_secret || !rsvp_ids || !action) {
      return NextResponse.json(
        { error: 'admin_secret, rsvp_ids (array), and action (approve|decline) required' },
        { status: 400 }
      );
    }

    if (!['approve', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or decline' }, { status: 400 });
    }

    const ids = Array.isArray(rsvp_ids) ? rsvp_ids.filter((id: unknown) => typeof id === 'string') : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid RSVP IDs' }, { status: 400 });
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
    const pending = rsvps.filter((r) => ids.includes(r.id) && r.status === 'pending');
    const pendingIds = pending.map((r) => r.id);

    if (pendingIds.length === 0) {
      return NextResponse.json({ error: 'No pending RSVPs found' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'declined';

    // Atomic capacity check for approve; plain update when no capacity
    const hasCapacity = event.capacity_limit != null && event.capacity_limit > 0;
    if (hasCapacity) {
      try {
        await approveRsvpsWithCapacityCheck(admin_secret, eventId, pendingIds, status);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Update failed';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    } else {
      await bulkUpdateRsvpStatus(pendingIds, status);
    }

    // Send emails
    for (const rsvp of pending) {
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
          console.error(`Failed to send email to ${guestEmail}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, updated: pendingIds.length });
  } catch (error) {
    console.error('Bulk RSVP update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    );
  }
}
