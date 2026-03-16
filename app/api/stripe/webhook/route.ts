import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret) as unknown as {
      type: string;
      data: { object: Record<string, unknown> };
    };
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string;
          customer?: string;
          customer_email?: string;
          subscription?: string;
          metadata?: { eventId?: string; userId?: string; tier?: string };
        };

        const metadata = session.metadata || {};
        const tier = metadata.tier;

        if (tier === 'organizer_hub' && metadata.userId) {
          await supabaseAdmin
            .from('users')
            .update({
              plan_tier: 'business',
              stripe_customer_id: session.customer || null,
              stripe_subscription_id: session.subscription || null,
              subscription_status: session.subscription ? 'active' : null,
            })
            .eq('id', metadata.userId);
        } else if (tier === 'keep' && metadata.eventId) {
          await supabaseAdmin
            .from('events')
            .update({
              keep_live: true,
              upgraded_at: new Date().toISOString(),
            })
            .eq('id', metadata.eventId);
        } else if (tier === 'pro_event' && metadata.eventId) {
          await supabaseAdmin
            .from('events')
            .update({
              plan_tier: 'business',
              upgraded_at: new Date().toISOString(),
            })
            .eq('id', metadata.eventId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as {
          id: string;
          status: string;
          customer: string;
        };

        const statusMap: Record<string, string | null> = {
          active: 'active',
          canceled: 'canceled',
          past_due: 'past_due',
          trialing: 'trialing',
          unpaid: 'past_due',
        };
        const subscriptionStatus = statusMap[subscription.status] ?? subscription.status;

        await supabaseAdmin
          .from('users')
          .update({
            subscription_status: subscriptionStatus,
            plan_tier: subscription.status === 'active' ? 'business' : 'free',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await supabaseAdmin
            .from('users')
            .update({
              plan_tier: 'free',
              stripe_subscription_id: null,
              subscription_status: subscriptionStatus,
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
