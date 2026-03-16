'use client';

import { useState } from 'react';
import type { Theme } from '@/types/database';
import { getThemeClasses } from '@/lib/utils/themes';

interface EventPageActionsProps {
  eventSlug: string;
  eventTitle: string;
  theme: Theme;
  customShareMessage?: string | null;
}

export default function EventPageActions({ eventSlug, eventTitle, theme, customShareMessage }: EventPageActionsProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const eventUrl = `${baseUrl}/e/${eventSlug}`;
  const icsUrl = `${baseUrl}/api/events/${eventSlug}/ics`;
  const shareText = customShareMessage?.trim() || `Join me at ${eventTitle}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          url: eventUrl,
          text: shareText,
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

  const themeClasses = getThemeClasses(theme);
  const btnClass = themeClasses.button;

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
