import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/db/events';
import { getRsvpStatsForEvent, getRsvpsForEvent } from '@/lib/db/rsvps';
import RsvpForm from '@/components/RsvpForm';
import EventPageActions from '@/components/EventPageActions';
import PublicGuestList from '@/components/PublicGuestList';
import EventPageContent from '@/components/EventPageContent';
import RecordPageView from '@/components/RecordPageView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Event is expired 7 days after it starts (free tier). Pro/business/keep_live stay live. */
function isEventExpired(
  startsAt: string,
  planTier: string | null | undefined,
  keepLive?: boolean
): boolean {
  if (planTier === 'pro' || planTier === 'business' || keepLive) {
    return false;
  }
  const start = new Date(startsAt).getTime();
  const expiry = start + 7 * 24 * 60 * 60 * 1000;
  return Date.now() > expiry;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: 'Event not found' };
  }
  const url = `${APP_URL}/e/${slug}`;
  const description =
    event.description?.slice(0, 160) ||
    `${event.title} — ${formatDate(event.starts_at)} at ${event.location_text}`;
  const ogImage = event.og_image_url || event.cover_image_url || `${APP_URL}/og-image.svg`;
  const siteName = event.hide_branding_in_share ? event.title : 'INVY';
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url,
      siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const rsvpOpen = event.rsvp_open ?? true;
  const expired = isEventExpired(event.starts_at, event.plan_tier, event.keep_live);
  const canRsvp = rsvpOpen && !expired;

  let spotsLeft: number | null = null;
  if (
    (event.plan_tier === 'pro' || event.plan_tier === 'business') &&
    event.capacity_limit != null &&
    event.capacity_limit > 0
  ) {
    const stats = await getRsvpStatsForEvent(event.id);
    const estimated = stats.estimatedGuests;
    spotsLeft = Math.max(0, event.capacity_limit - estimated);
  }

  const theme = (event.theme || 'light') as 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'lavender';

  const visibility = event.guest_list_visibility || 'host_only';
  const cookieStore = await cookies();
  const rsvpCookie = cookieStore.get('invy_rsvp')?.value?.split(',') ?? [];
  const approvedCookie = cookieStore.get('invy_approved')?.value?.split(',') ?? [];
  const approvedEventIds = new Set(approvedCookie.filter(Boolean));
  const showGuestList =
    visibility === 'public' || (visibility === 'attendees_only' && rsvpCookie.includes(event.id));
  const guestListRsvps = showGuestList ? await getRsvpsForEvent(event.id) : [];

  return (
    <>
      <RecordPageView eventId={event.id} />
      <EventPageContent
        event={{
          ...event,
          page_style: (event as any).page_style || 'modern',
          cover_image_url: (event as any).cover_image_url ?? null,
          poster_image_url: (event as any).poster_image_url ?? null,
          cover_image_position: (event as any).cover_image_position || 'center',
          rsvp_mode: (event as any).rsvp_mode || 'instant',
          hide_location_until_approved: (event as any).hide_location_until_approved ?? false,
          hide_private_note_until_approved: (event as any).hide_private_note_until_approved ?? false,
          private_note: (event as any).private_note ?? null,
          show_organizer_contact: (event as any).show_organizer_contact ?? false,
          organizer_contact_email: (event as any).organizer_contact_email ?? null,
          organizer_contact_phone: (event as any).organizer_contact_phone ?? null,
          organizer_contact_instagram: (event as any).organizer_contact_instagram ?? null,
          organizer_contact_whatsapp: (event as any).organizer_contact_whatsapp ?? null,
          organizer_contact_text: (event as any).organizer_contact_text ?? null,
        }}
        theme={theme}
        canRsvp={canRsvp}
        rsvpOpen={rsvpOpen}
        expired={expired}
        spotsLeft={spotsLeft}
        guestListRsvps={guestListRsvps}
        showGuestList={showGuestList}
        isApproved={approvedEventIds.has(event.id)}
      />
    </>
  );
}
