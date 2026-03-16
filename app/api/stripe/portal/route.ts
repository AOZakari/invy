import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession, getValidAppUrl, sanitizeBaseUrl } from '@/lib/stripe/checkout';
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

    const reqUrl = request.nextUrl ?? new URL(request.url);
    const returnUrl = `${sanitizeBaseUrl(getValidAppUrl(reqUrl.origin))}/dashboard/billing`;

    const { url } = await createPortalSession({
      customerId: user.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    return NextResponse.json(
      { error: 'Could not open billing. Please try again.' },
      { status: 500 }
    );
  }
}
