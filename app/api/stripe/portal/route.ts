import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe/checkout';
import { getUserFromSession } from '@/lib/auth/user';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Subscribe to Organizer Hub first.' },
        { status: 400 }
      );
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';
    const returnUrl = `${APP_URL}/dashboard/billing`;

    const { url } = await createPortalSession({
      customerId: user.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Portal failed' },
      { status: 500 }
    );
  }
}
