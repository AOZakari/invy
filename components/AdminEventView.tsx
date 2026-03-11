'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Event, RSVP } from '@/types/database';
import type { RsvpStats } from '@/lib/db/rsvps';
import { MVP_PRICING } from '@/types/database';
import RsvpList from './RsvpList';
import EventStats from './EventStats';
import CopyButton from './CopyButton';

interface AdminEventViewProps {
  event: Event;
  rsvps: RSVP[];
  stats: RsvpStats;
  adminSecret: string;
}

export default function AdminEventView({
  event: initialEvent,
  rsvps: initialRsvps,
  stats: initialStats,
  adminSecret,
}: AdminEventViewProps) {
  const [event, setEvent] = useState(initialEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [stats, setStats] = useState(initialStats);

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${event.slug}` : '';
  const manageUrl = typeof window !== 'undefined' ? `${window.location.origin}/manage/${adminSecret}` : '';

  async function handleRsvpOpenToggle() {
    const next = !(event.rsvp_open ?? true);
    setError(null);
    try {
      const res = await fetch(`/api/manage/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: adminSecret, rsvp_open: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setEvent({ ...event, rsvp_open: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  async function handleDuplicate() {
    setError(null);
    try {
      const res = await fetch(`/api/manage/events/${event.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: adminSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate');
      window.location.href = `/created?slug=${data.slug}&adminSecret=${data.adminSecret}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this event? RSVPs will be removed. This cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch(`/api/manage/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: adminSecret }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  function handleExportCsv() {
    const headers = ['Name', 'Email', 'Status', '+1', 'Date'];
    const rows = rsvps.map((r) => [
      (r.name || '').replace(/"/g, '""'),
      r.contact_info.replace(/"/g, '""'),
      r.status,
      r.plus_one,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps-${event.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpdate(formData: FormData) {
    setIsSaving(true);
    setError(null);

    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const startsAt = date && time ? new Date(`${date}T${time}`).toISOString() : undefined;

    const updateData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location_text: formData.get('location_text') as string,
      location_url: formData.get('location_url') as string,
      theme: formData.get('theme') as string,
      notify_on_rsvp: formData.get('notify_on_rsvp') === 'on',
    };

    if (startsAt) {
      updateData.starts_at = startsAt;
    }

    // Remove empty strings
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === '') {
        delete updateData[key];
      }
    });

    try {
      const response = await fetch(`/api/manage/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updateData, admin_secret: adminSecret }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event');
      }

      setEvent(result.event);
      setIsEditing(false);
      // Refresh page to get updated RSVPs/stats if needed
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSaving(false);
    }
  }

  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  function formatTimeForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your Event</h1>
          <p className="text-gray-600 dark:text-gray-400">{event.title}</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Public Event Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                />
                <CopyButton text={publicUrl} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Manage Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={manageUrl}
                  className="flex-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm"
                />
                <CopyButton text={manageUrl} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats + RSVP toggle + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <EventStats stats={stats} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">RSVPs</span>
              <button
                type="button"
                onClick={handleRsvpOpenToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  event.rsvp_open ?? true
                    ? 'bg-gray-900 dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    event.rsvp_open ?? true ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="font-medium">{event.rsvp_open ?? true ? 'Open' : 'Closed'}</span>
            </label>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Duplicate event
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete event
            </button>
          </div>
        </div>

        {/* Edit Event Form */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Event Details</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form action={handleUpdate} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={event.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={formatDateForInput(event.starts_at)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={formatTimeForInput(event.starts_at)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location_text"
                  defaultValue={event.location_text}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Map Link (optional)</label>
                <input
                  type="url"
                  name="location_url"
                  defaultValue={event.location_url || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={event.description || ''}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  name="theme"
                  defaultValue={event.theme}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="notify_on_rsvp"
                  id="notify_on_rsvp"
                  defaultChecked={event.notify_on_rsvp}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-900 dark:focus:ring-white"
                />
                <label htmlFor="notify_on_rsvp" className="text-sm text-gray-700 dark:text-gray-300">
                  Email me whenever someone RSVPs
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Title:</span> {event.title}
              </div>
              <div>
                <span className="font-medium">Date & Time:</span>{' '}
                {new Date(event.starts_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Location:</span> {event.location_text}
                {event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    (map)
                  </a>
                )}
              </div>
              {event.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 whitespace-pre-line">{event.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Theme:</span> {event.theme}
              </div>
              <div>
                <span className="font-medium">Email alerts:</span> {event.notify_on_rsvp ? 'On' : 'Off'}
              </div>
            </div>
          )}
        </div>

        {/* RSVP List */}
        <RsvpList rsvps={rsvps} />

        {/* Upgrade placeholder */}
        <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-2">Upgrade</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Unlock more features. Billing coming soon.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-medium">{MVP_PRICING.keep.label}</p>
              <p className="text-2xl font-bold">€{MVP_PRICING.keep.price}</p>
              <p className="text-xs text-gray-500">per event</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-medium">{MVP_PRICING.proEvent.label}</p>
              <p className="text-2xl font-bold">€{MVP_PRICING.proEvent.price}</p>
              <p className="text-xs text-gray-500">per event</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-medium">{MVP_PRICING.organizerHub.label}</p>
              <p className="text-2xl font-bold">€{MVP_PRICING.organizerHub.price}</p>
              <p className="text-xs text-gray-500">/ month</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard/billing" className="text-gray-900 dark:text-gray-100 underline">
              Billing & plans
            </Link>
            {' · '}
            Coming soon
          </p>
        </div>
      </div>
    </main>
  );
}

