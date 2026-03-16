'use client';

import type { Event, Theme, RSVP } from '@/types/database';
import { getThemePreset, getPageStylePreset, RADIUS_CLASSES } from '@/lib/utils/presets';
import RsvpForm from './RsvpForm';
import EventPageActions from './EventPageActions';
import PublicGuestList from './PublicGuestList';
import OrganizerContactSection from './OrganizerContactSection';

interface EventPageContentProps {
  event: Event;
  theme: Theme;
  canRsvp: boolean;
  rsvpOpen: boolean;
  expired: boolean;
  spotsLeft: number | null;
  guestListRsvps: RSVP[];
  showGuestList: boolean;
  isApproved?: boolean;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventPageContent({
  event,
  theme,
  canRsvp,
  rsvpOpen,
  expired,
  spotsLeft,
  guestListRsvps,
  showGuestList,
  isApproved = false,
}: EventPageContentProps) {
  const preset = getThemePreset(theme);
  const pageStyle = getPageStylePreset((event.page_style as 'classic' | 'modern' | 'bold') || 'modern');
  const radiusClass = RADIUS_CLASSES[preset.radius];
  const hasCover = !!event.cover_image_url;
  const hasPoster = !!event.poster_image_url;
  const isPremium = hasCover || hasPoster || (event.page_style && event.page_style !== 'modern');

  const hideLocation = (event as any).hide_location_until_approved && !isApproved;
  const hidePrivateNote = (event as any).hide_private_note_until_approved && !isApproved;
  const coverPosition =
    event.cover_image_position === 'top'
      ? 'object-[center_top]'
      : event.cover_image_position === 'bottom'
        ? 'object-[center_bottom]'
        : 'object-center';

  return (
    <main className={`min-h-screen transition-colors duration-300 ${preset.main}`}>
      {/* Hero: cover image or top section */}
      <header className="relative overflow-hidden">
        {hasCover && (
          <div className="relative h-[40vh] min-h-[240px] max-h-[400px] w-full">
            <img
              src={event.cover_image_url!}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${coverPosition}`}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {event.title}
              </h1>
              {hasPoster && pageStyle.posterTreatment === 'floating' && (
                <div className="absolute top-6 right-6 w-20 h-20 md:w-24 md:h-24">
                  <img
                    src={event.poster_image_url!}
                    alt=""
                    className={`w-full h-full object-cover ${radiusClass} shadow-xl ring-2 ring-white/20`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {!hasCover && (
          <div className="px-4 pt-12 md:pt-16 pb-8">
            <div className="max-w-2xl mx-auto">
              {hasPoster && pageStyle.posterTreatment === 'card' && (
                <div className="flex justify-center mb-6">
                  <img
                    src={event.poster_image_url!}
                    alt=""
                    className={`w-32 h-32 object-cover ${radiusClass} ${preset.shadow}`}
                  />
                </div>
              )}
              <h1
                className={`font-bold ${
                  pageStyle.titleScale === 'bold'
                    ? 'text-4xl md:text-6xl'
                    : pageStyle.titleScale === 'compact'
                      ? 'text-3xl md:text-4xl'
                      : 'text-4xl md:text-5xl'
                }`}
              >
                {event.title}
              </h1>
              {event.description && (
                <p className={`mt-3 text-lg ${preset.muted} whitespace-pre-line`}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Content area */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Metadata: date, time, location, spots */}
        <div
          className={
            pageStyle.metadataLayout === 'chips'
              ? 'flex flex-wrap gap-2 mt-4 md:mt-6'
              : 'space-y-4 mt-6'
          }
        >
          {pageStyle.metadataLayout === 'chips' ? (
            <>
              <span
                className={`inline-flex items-center px-3 py-1.5 text-sm ${preset.surface} ${preset.border} ${radiusClass} ${preset.shadow}`}
              >
                {formatDate(event.starts_at)}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1.5 text-sm ${preset.surface} ${preset.border} ${radiusClass} ${preset.shadow}`}
              >
                {formatTime(event.starts_at)}
                {event.ends_at && ` – ${formatTime(event.ends_at)}`}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1.5 text-sm ${preset.surface} ${preset.border} ${radiusClass} ${preset.shadow}`}
              >
                {hideLocation ? 'Location shared after approval' : event.location_text}
              </span>
              {spotsLeft !== null && (
                <span
                  className={`inline-flex items-center px-3 py-1.5 text-sm ${preset.surface} ${preset.border} ${radiusClass} ${preset.shadow}`}
                >
                  {spotsLeft === 0 ? 'Fully booked' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
                </span>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <p className={`text-xs uppercase tracking-wide ${preset.muted}`}>Date</p>
                <div className="font-medium">{formatDate(event.starts_at)}</div>
                <div className={`text-sm ${preset.muted}`}>
                  {formatTime(event.starts_at)}
                  {event.ends_at && ` – ${formatTime(event.ends_at)}`}
                </div>
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wide ${preset.muted}`}>Location</p>
                <div className="font-medium">
                  {hideLocation ? 'Location shared after approval' : event.location_text}
                </div>
                {!hideLocation && event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${preset.accent} hover:underline`}
                  >
                    View on map
                  </a>
                )}
              </div>
              {spotsLeft !== null && (
                <div>
                  <p className={`text-xs uppercase tracking-wide ${preset.muted}`}>Spots</p>
                  <div className="font-medium">
                    {spotsLeft === 0 ? 'Fully booked' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description when we have cover (title was in hero) */}
        {hasCover && event.description && (
          <p className={`mt-4 text-lg ${preset.muted} whitespace-pre-line`}>{event.description}</p>
        )}

        {/* Private note (Pro request mode, shown when approved) */}
        {!hidePrivateNote && (event as any).private_note && (
          <div className={`mt-4 p-4 ${preset.surface} ${preset.border} ${radiusClass} ${preset.shadow}`}>
            <p className={`text-sm font-medium ${preset.muted} mb-1`}>Details for attendees</p>
            <p className="whitespace-pre-line">{(event as any).private_note}</p>
          </div>
        )}

        {/* Organizer contact (Pro/Hub, when enabled and populated) */}
        {(event as any).show_organizer_contact && (
          <OrganizerContactSection
            email={(event as any).organizer_contact_email ?? null}
            phone={(event as any).organizer_contact_phone ?? null}
            instagram={(event as any).organizer_contact_instagram ?? null}
            whatsapp={(event as any).organizer_contact_whatsapp ?? null}
            customText={(event as any).organizer_contact_text ?? null}
            theme={theme}
          />
        )}

        {/* Actions */}
        <div className="mt-6">
          <EventPageActions
            eventSlug={event.slug}
            eventTitle={event.title}
            theme={theme}
            customShareMessage={event.custom_share_message}
          />
        </div>

        {/* RSVP section */}
        <div className="mt-10">
          {expired ? (
            <div
              className={`py-8 px-6 ${radiusClass} border ${preset.border} ${preset.surface} text-center ${preset.muted}`}
            >
              <p className="font-medium">This event has ended.</p>
              <p className="text-sm mt-1">RSVPs are no longer accepted.</p>
            </div>
          ) : !rsvpOpen ? (
            <div
              className={`py-8 px-6 ${radiusClass} border ${preset.border} ${preset.surface} text-center ${preset.muted}`}
            >
              <p className="font-medium">RSVPs are closed.</p>
              <p className="text-sm mt-1">The organizer is no longer accepting responses.</p>
            </div>
          ) : spotsLeft === 0 ? (
            <div
              className={`py-8 px-6 ${radiusClass} border ${preset.border} ${preset.surface} text-center ${preset.muted}`}
            >
              <p className="font-medium">This event is fully booked.</p>
            </div>
          ) : (
            <div
              className={`p-6 md:p-8 ${radiusClass} border ${preset.border} ${preset.surface} ${
                pageStyle.cardStyle === 'floating' ? `${preset.shadow}` : ''
              } ${pageStyle.cardStyle === 'elevated' ? 'shadow-lg' : ''}`}
            >
              <RsvpForm
                eventId={event.id}
                eventSlug={event.slug}
                theme={theme}
                customRsvpFields={event.custom_rsvp_fields || []}
                requestMode={(event as any).rsvp_mode === 'request'}
              />
            </div>
          )}
        </div>

        {showGuestList && <PublicGuestList rsvps={guestListRsvps} />}
      </div>
    </main>
  );
}
