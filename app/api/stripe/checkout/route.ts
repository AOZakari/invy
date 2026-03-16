import { NextRequest, NextResponse } from 'next/server';
import { createEventCheckoutSession, createHubCheckoutSession } from '@/lib/stripe/checkout';
import { getUserFromSession } from '@/lib/auth/user';
import { getEventById, getEventByAdminSecret } from '@/lib/db/events';
import { z } from 'zod';

const bodySchema = z.object({
  tier: z.enum(['keep', 'pro_event', 'organizer_hub']),
  eventId: z.string().uuid().optional(),
  adminSecret: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tier, eventId, adminSecret } = parsed.data;
    const url = request.nextUrl ?? new URL(request.url);
    const requestOrigin = url.origin;

    if (tier === 'organizer_hub') {
      const user = await getUserFromSession();
      if (!user) {
        return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
      }

      const { url } = await createHubCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        requestOrigin,
      });

      return NextResponse.json({ url });
    }

    if (tier === 'keep' || tier === 'pro_event') {
      if (!eventId || !adminSecret) {
        return NextResponse.json({ error: 'eventId and adminSecret required for event upgrades' }, { status: 400 });
      }

      const event = await getEventByAdminSecret(adminSecret);
      if (!event || event.id !== eventId) {
        return NextResponse.json({ error: 'Invalid event or manage link' }, { status: 403 });
      }

      const { url } = await createEventCheckoutSession({
        eventId,
        tier,
        adminSecret,
        requestOrigin,
      });

      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}
