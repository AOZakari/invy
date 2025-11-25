import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/db/events';
import RsvpForm from '@/components/RsvpForm';
import type { Event } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isDark = event.theme === 'dark';
  const themeClasses = isDark
    ? 'bg-gray-900 text-gray-100'
    : 'bg-white text-gray-900';

  return (
    <main className={`min-h-screen ${themeClasses}`}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Event Header */}
        <div className="space-y-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            {event.description && (
              <p className="text-lg opacity-80 whitespace-pre-line">{event.description}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-medium">{formatDate(event.starts_at)}</div>
                <div className="text-sm opacity-70">{formatTime(event.starts_at)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-medium">{event.location_text}</div>
                {event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm opacity-70 hover:opacity-100 underline"
                  >
                    View on map →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Form */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <RsvpForm eventId={event.id} eventSlug={slug} theme={event.theme} />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm opacity-60">
          <p>Powered by INVY</p>
        </div>
      </div>
    </main>
  );
}
