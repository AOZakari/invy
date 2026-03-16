'use client';

import { useState } from 'react';
import type { RSVPStatus, Theme, CustomRsvpField } from '@/types/database';
import { getThemeClasses } from '@/lib/utils/themes';

interface RsvpFormProps {
  eventId: string;
  eventSlug: string;
  theme: Theme;
  customRsvpFields?: CustomRsvpField[];
  /** Request-to-attend mode: guest requests instead of instant confirm */
  requestMode?: boolean;
}

export default function RsvpForm({ eventId, eventSlug, theme, customRsvpFields = [], requestMode = false }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const themeClasses = getThemeClasses(theme);
  const inputClasses = themeClasses.input;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const custom_field_values: Record<string, string | number | boolean> = {};
    for (const field of customRsvpFields) {
      if (field.type === 'checkbox') {
        custom_field_values[field.id] = formData.get(`custom_${field.id}`) === 'on';
      } else {
        const val = formData.get(`custom_${field.id}`);
        if (val !== null && val !== '') {
          if (field.type === 'number') custom_field_values[field.id] = Number(val);
          else custom_field_values[field.id] = String(val);
        }
      }
    }

    const data = {
      name: (formData.get('name') as string)?.trim() || '',
      contact_info: (formData.get('contact_info') as string)?.trim() || '',
      status: (requestMode ? 'pending' : formData.get('status')) as RSVPStatus,
      plus_one: parseInt(formData.get('plus_one') as string) || 0,
      custom_field_values: Object.keys(custom_field_values).length > 0 ? custom_field_values : undefined,
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
    return <SuccessState eventSlug={eventSlug} theme={theme} requestMode={requestMode} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{requestMode ? 'Request to join' : 'RSVP'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className={`px-4 py-3 rounded ${themeClasses.error}`}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="contact_info" className="block text-sm font-medium mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="contact_info"
            name="contact_info"
            required
            maxLength={500}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
            placeholder="you@example.com"
          />
          <p className="text-xs opacity-70 mt-1">
            We’ll send your confirmation here. No account needed.
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength={200}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
            placeholder="Your name"
          />
        </div>

        {!requestMode && (
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
        )}

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

        {customRsvpFields.map((field) => (
          <div key={field.id}>
            <label htmlFor={`custom_${field.id}`} className="block text-sm font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                id={`custom_${field.id}`}
                name={`custom_${field.id}`}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
              />
            )}
            {field.type === 'number' && (
              <input
                type="number"
                id={`custom_${field.id}`}
                name={`custom_${field.id}`}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
              />
            )}
            {field.type === 'checkbox' && (
              <input
                type="checkbox"
                id={`custom_${field.id}`}
                name={`custom_${field.id}`}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            {field.type === 'select' && (
              <select
                id={`custom_${field.id}`}
                name={`custom_${field.id}`}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputClasses}`}
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.button}`}
        >
          {isSubmitting ? 'Sending...' : requestMode ? 'Request to join' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  );
}

function SuccessState({ eventSlug, theme, requestMode = false }: { eventSlug: string; theme: Theme; requestMode?: boolean }) {
  const [copied, setCopied] = useState(false);
  const themeClasses = getThemeClasses(theme);
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
      const endDate = event.ends_at ? new Date(event.ends_at) : undefined;
      const icsContent = generateICS({
        title: event.title,
        description: event.description || undefined,
        start: startDate,
        end: endDate,
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

  const whatsappUrl = publicUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${publicUrl}`)}`
    : '';

  return (
    <div className="text-center space-y-4 py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
      <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {requestMode ? 'Request sent' : 'All set'}
      </p>
      <h2 className="text-3xl font-bold">
        {requestMode ? 'Your request has been sent' : 'Thanks for RSVPing'}
      </h2>
      <p className="opacity-80">
        {requestMode
          ? "The organizer will review it and confirm your spot. You'll receive a confirmation if approved."
          : "We've logged your response and sent a confirmation to your email."}
      </p>

      {!requestMode && (
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={handleAddToCalendar}
          className={`px-6 py-3 rounded-lg font-medium border ${themeClasses.button}`}
        >
          Add to calendar
        </button>
        <button
          onClick={handleShare}
          className={`px-6 py-3 rounded-lg font-medium border ${themeClasses.button}`}
        >
          {copied ? '✓ Link copied' : 'Share event'}
        </button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex px-6 py-3 rounded-lg font-medium border ${themeClasses.button}`}
          >
            Share on WhatsApp
          </a>
        )}
      </div>
      )}
    </div>
  );
}


