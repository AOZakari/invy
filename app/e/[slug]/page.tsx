import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/db/events';
import { getRsvpStatsForEvent } from '@/lib/db/rsvps';
import RsvpForm from '@/components/RsvpForm';
import EventPageActions from '@/components/EventPageActions';

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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Event is expired 7 days after it starts (free tier). Pro/business tiers stay live. */
function isEventExpired(startsAt: string, planTier: string | null | undefined): boolean {
  if (planTier === 'pro' || planTier === 'business') {
    return false; // Keep and Pro Event stay live
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
  const ogImage = `${APP_URL}/og-image.svg`;
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url,
      siteName: 'INVY',
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
  const expired = isEventExpired(event.starts_at, event.plan_tier);
  const canRsvp = rsvpOpen && !expired;

  let spotsLeft: number | null = null;
  if (event.capacity_limit != null && event.capacity_limit > 0) {
    const stats = await getRsvpStatsForEvent(event.id);
    const goingCount = stats.yes + stats.maybe; // approximate; yes + plus_ones would be more accurate
    const estimated = stats.estimatedGuests;
    spotsLeft = Math.max(0, event.capacity_limit - estimated);
  }

  const isDark = event.theme === 'dark';
  const themeClasses = isDark
    ? 'bg-gray-950 text-gray-100'
    : 'bg-white text-gray-900';

  return (
    <main className={`min-h-screen ${themeClasses}`}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            {event.description && (
              <p className="text-lg opacity-80 whitespace-pre-line">{event.description}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</p>
              <div className="font-medium">{formatDate(event.starts_at)}</div>
              <div className="text-sm opacity-70">
                {formatTime(event.starts_at)}
                {event.ends_at && ` – ${formatTime(event.ends_at)}`}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Location</p>
              <div className="font-medium">{event.location_text}</div>
              {event.location_url && (
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-70 hover:opacity-100 underline"
                >
                  View on map
                </a>
              )}
            </div>

            {spotsLeft !== null && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Spots</p>
                <div className="font-medium">
                  {spotsLeft === 0 ? 'Fully booked' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
                </div>
              </div>
            )}
          </div>

          <EventPageActions
            eventSlug={slug}
            eventTitle={event.title}
            isDark={isDark}
          />
        </div>

        {expired ? (
          <div className="py-8 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center opacity-80">
            <p className="font-medium">This event has ended.</p>
            <p className="text-sm mt-1">RSVPs are no longer accepted.</p>
          </div>
        ) : !rsvpOpen ? (
          <div className="py-8 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center opacity-80">
            <p className="font-medium">RSVPs are closed.</p>
            <p className="text-sm mt-1">The organizer is no longer accepting responses.</p>
          </div>
        ) : spotsLeft === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center opacity-80">
            <p className="font-medium">This event is fully booked.</p>
          </div>
        ) : (
          <RsvpForm eventId={event.id} eventSlug={slug} theme={event.theme} />
        )}
      </div>
    </main>
  );
}
