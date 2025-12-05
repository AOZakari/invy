'use client';

import { useState } from 'react';
import type { RSVPStatus, Theme } from '@/types/database';

interface RsvpFormProps {
  eventId: string;
  eventSlug: string;
  theme: Theme;
}

export default function RsvpForm({ eventId, eventSlug, theme }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isDark = theme === 'dark';
  const inputClasses = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-white'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-black';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      contact_info: formData.get('contact_info') as string,
      status: formData.get('status') as RSVPStatus,
      plus_one: parseInt(formData.get('plus_one') as string) || 0,
    };

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit RSVP');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessState eventSlug={eventSlug} theme={theme} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">RSVP</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className={`px-4 py-3 rounded ${
              isDark
                ? 'bg-red-900/20 border border-red-800 text-red-200'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={200}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="contact_info" className="block text-sm font-medium mb-2">
            Contact Info <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact_info"
            name="contact_info"
            required
            maxLength={500}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
            placeholder="Email, phone, Instagram, WhatsApp, etc."
          />
          <p className="text-xs opacity-70 mt-1">
            How should we reach you? Any format works.
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Will you attend? <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            required
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
          >
            <option value="">Select...</option>
            <option value="yes">Yes, I'll be there!</option>
            <option value="maybe">Maybe</option>
            <option value="no">Sorry, can't make it</option>
          </select>
        </div>

        <div>
          <label htmlFor="plus_one" className="block text-sm font-medium mb-2">
            Bringing a +1?
          </label>
          <input
            type="number"
            id="plus_one"
            name="plus_one"
            min="0"
            max="10"
            defaultValue="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
          />
          <p className="text-xs opacity-70 mt-1">
            Number of additional guests (0 if none)
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-white text-black hover:opacity-90'
              : 'bg-black text-white hover:opacity-90'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  );
}

function SuccessState({ eventSlug, theme }: { eventSlug: string; theme: Theme }) {
  const [copied, setCopied] = useState(false);

  const isDark = theme === 'dark';
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${eventSlug}` : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this event',
          url: publicUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      const response = await fetch(`/api/events/${eventSlug}`);
      if (!response.ok) return;

      const event = await response.json();
      const { generateICS } = await import('@/lib/utils/ics');
      const startDate = new Date(event.starts_at);
      const icsContent = generateICS({
        title: event.title,
        description: event.description || undefined,
        start: startDate,
        location: event.location_text,
        locationUrl: event.location_url || undefined,
      });
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.slug}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate calendar file:', err);
    }
  };

  return (
    <div className="text-center space-y-4 py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
      <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">All set</p>
      <h2 className="text-3xl font-bold">Thanks for RSVPing</h2>
      <p className="opacity-80">We’ve logged your response. Grab whatever you need below.</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={handleAddToCalendar}
          className={`px-6 py-3 rounded-lg font-medium border ${
            isDark
              ? 'border-white text-white hover:bg-white hover:text-gray-900'
              : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
          }`}
        >
          Add to calendar
        </button>

        <button
          onClick={handleShare}
          className={`px-6 py-3 rounded-lg font-medium border ${
            isDark
              ? 'border-white text-white hover:bg-white hover:text-gray-900'
              : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
          }`}
        >
          {copied ? '✓ Link copied' : 'Share event'}
        </button>
      </div>
    </div>
  );
}


