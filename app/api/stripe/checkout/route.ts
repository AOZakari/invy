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
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

    if (tier === 'organizer_hub') {
      const user = await getUserFromSession();
      if (!user) {
        return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
      }

      const { url } = await createHubCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        successUrl: `${APP_URL}/dashboard/billing?success=true`,
        cancelUrl: `${APP_URL}/dashboard/billing?canceled=true`,
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
        successUrl: `${APP_URL}/manage/${adminSecret}?upgraded=true`,
        cancelUrl: `${APP_URL}/manage/${adminSecret}?canceled=true`,
      });

      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
