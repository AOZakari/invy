'use client';

import { useState } from 'react';

interface EventPageActionsProps {
  eventSlug: string;
  eventTitle: string;
  isDark: boolean;
}

export default function EventPageActions({ eventSlug, eventTitle, isDark }: EventPageActionsProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const eventUrl = `${baseUrl}/e/${eventSlug}`;
  const icsUrl = `${baseUrl}/api/events/${eventSlug}/ics`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          url: eventUrl,
          text: `Join me at ${eventTitle}`,
        });
      } catch {
        // User cancelled or error — fallback to copy
        await copyUrl();
      }
    } else {
      await copyUrl();
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const btnClass = isDark
    ? 'border border-white text-white hover:bg-white hover:text-gray-900'
    : 'border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white';

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={icsUrl}
        download
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass}`}
      >
        Add to calendar
      </a>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass}`}
      >
        {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  );
}
