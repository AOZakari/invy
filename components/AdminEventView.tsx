'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Event, RSVP, CustomRsvpField, User } from '@/types/database';
import type { RsvpStats } from '@/lib/db/rsvps';
import { MVP_PRICING } from '@/types/database';
import { canUseFeature, getEffectiveTier } from '@/lib/permissions/capabilities';
import { THEME_OPTIONS, FREE_THEMES } from '@/lib/utils/themes';
import RsvpList from './RsvpList';
import RsvpListWithApproval from './RsvpListWithApproval';
import EventStats from './EventStats';
import CopyButton from './CopyButton';
import AnalyticsWidget from './AnalyticsWidget';

function ImageUploadField({
  label,
  imageUrl,
  eventId,
  adminSecret,
  type,
  onUpdate,
}: {
  label: string;
  imageUrl: string | null | undefined;
  eventId: string;
  adminSecret: string;
  type: 'cover' | 'poster';
  onUpdate: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('admin_secret', adminSecret);
      formData.set('type', type);
      const res = await fetch(`/api/manage/events/${eventId}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUpdate(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemove() {
    setUploadError(null);
    try {
      const res = await fetch(`/api/manage/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_secret: adminSecret,
          [type === 'cover' ? 'cover_image_url' : 'poster_image_url']: null,
        }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      onUpdate(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {imageUrl ? (
        <div className="space-y-2">
          <img src={imageUrl} alt="" className="max-h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
          <div className="flex gap-2">
            <label className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Change'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} className="hidden" />
            </label>
            <button type="button" onClick={handleRemove} className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="block px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 text-center text-sm text-gray-500 dark:text-gray-400">
          {uploading ? 'Uploading...' : 'Upload image (JPEG, PNG, WebP, max 5MB)'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      )}
      {uploadError && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{uploadError}</p>}
    </div>
  );
}

function UpgradeButton({
  tier,
  eventId,
  adminSecret,
  onError,
}: {
  tier: 'keep' | 'pro_event';
  eventId: string;
  adminSecret: string;
  onError: (msg: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    onError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, eventId, adminSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-auto px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
    >
      {loading ? 'Redirecting...' : 'Upgrade'}
    </button>
  );
}

interface AdminEventViewProps {
  event: Event;
  rsvps: RSVP[];
  stats: RsvpStats;
  adminSecret: string;
  /** When provided (e.g. from dashboard), user tier grants Pro/Business on all their events */
  user?: User | null;
}

export default function AdminEventView({
  event: initialEvent,
  rsvps: initialRsvps,
  stats: initialStats,
  adminSecret,
  user = null,
}: AdminEventViewProps) {
  const [event, setEvent] = useState(initialEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [stats, setStats] = useState(initialStats);
  const [editedCustomFields, setEditedCustomFields] = useState<CustomRsvpField[]>([]);

  useEffect(() => {
    if (isEditing) {
      setEditedCustomFields(event.custom_rsvp_fields || []);
    }
  }, [isEditing, event.custom_rsvp_fields]);

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
    const customHeaders = (event.custom_rsvp_fields || []).map((f) => f.label);
    const headers = ['Name', 'Email', 'Status', '+1', ...customHeaders, 'Date'];
    const rows = rsvps.map((r) => {
      const base = [
        (r.name || '').replace(/"/g, '""'),
        r.contact_info.replace(/"/g, '""'),
        r.status,
        r.plus_one,
      ];
      const customVals = (event.custom_rsvp_fields || []).map((f) => {
        const v = r.custom_field_values?.[f.id];
        const s = v === undefined || v === null ? '' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
        return s.replace(/"/g, '""');
      });
      return [...base, ...customVals, new Date(r.created_at).toLocaleDateString()];
    });
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

    const updateData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location_text: formData.get('location_text') as string,
      location_url: formData.get('location_url') as string,
      theme: formData.get('theme') as string,
      notify_on_rsvp: formData.get('notify_on_rsvp') === 'on',
    };

    if (date) updateData.date = date;
    if (time) updateData.time = time;

    if (canUseFeature(user ?? null, event, 'capacity_limits')) {
      const cap = formData.get('capacity_limit') as string;
      updateData.capacity_limit = cap?.trim() && Number(cap) > 0 ? Number(cap) : null;
    }

    if (canUseFeature(user ?? null, event, 'custom_slug')) {
      const slugVal = formData.get('slug') as string;
      if (slugVal?.trim()) updateData.slug = slugVal.trim().toLowerCase();
    }

    if (canUseFeature(user ?? null, event, 'link_preview_cards')) {
      const ogVal = formData.get('og_image_url') as string;
      updateData.og_image_url = ogVal?.trim() || null;
    }

    if (canUseFeature(user ?? null, event, 'page_style')) {
      const ps = formData.get('page_style') as string;
      if (['classic', 'modern', 'bold'].includes(ps)) updateData.page_style = ps as any;
    }

    if (canUseFeature(user ?? null, event, 'cover_image')) {
      const pos = formData.get('cover_image_position') as string;
      if (['top', 'center', 'bottom'].includes(pos)) updateData.cover_image_position = pos as any;
    }

    if (canUseFeature(user ?? null, event, 'guest_list_controls')) {
      const vis = formData.get('guest_list_visibility') as string;
      if (['host_only', 'public', 'attendees_only'].includes(vis)) updateData.guest_list_visibility = vis;
    }

    if (canUseFeature(user ?? null, event, 'share_controls')) {
      const shareMsg = formData.get('custom_share_message') as string;
      updateData.custom_share_message = shareMsg?.trim() || null;
      updateData.hide_branding_in_share = formData.get('hide_branding_in_share') === 'on';
    }

    if (canUseFeature(user ?? null, event, 'email_reminders')) {
      updateData.send_reminder_1_day = formData.get('send_reminder_1_day') === 'on';
    }

    if (canUseFeature(user ?? null, event, 'white_label')) {
      updateData.hide_branding = formData.get('hide_branding') === 'on';
    }

    if (canUseFeature(user ?? null, event, 'request_to_attend')) {
      const mode = formData.get('rsvp_mode') as string;
      if (['instant', 'request'].includes(mode)) updateData.rsvp_mode = mode as any;
      updateData.hide_location_until_approved = formData.get('hide_location_until_approved') === 'on';
      updateData.hide_private_note_until_approved = formData.get('hide_private_note_until_approved') === 'on';
      const pn = formData.get('private_note') as string;
      updateData.private_note = pn?.trim() || null;
    }

    if (canUseFeature(user ?? null, event, 'organizer_contact')) {
      updateData.show_organizer_contact = formData.get('show_organizer_contact') === 'on';
      const oce = formData.get('organizer_contact_email') as string;
      updateData.organizer_contact_email = oce?.trim() || null;
      const ocp = formData.get('organizer_contact_phone') as string;
      updateData.organizer_contact_phone = ocp?.trim() || null;
      const oci = formData.get('organizer_contact_instagram') as string;
      updateData.organizer_contact_instagram = oci?.trim() || null;
      const ocw = formData.get('organizer_contact_whatsapp') as string;
      updateData.organizer_contact_whatsapp = ocw?.trim() || null;
      const oct = formData.get('organizer_contact_text') as string;
      updateData.organizer_contact_text = oct?.trim() || null;
    }

    if (canUseFeature(user ?? null, event, 'custom_rsvp_fields')) {
      const valid = editedCustomFields.filter(
        (f) => f.label?.trim() && ['text', 'select', 'checkbox', 'number'].includes(f.type)
      );
      updateData.custom_rsvp_fields = valid.map((f) => ({
        id: f.id,
        label: f.label.trim(),
        type: f.type,
        required: f.required ?? false,
        options: f.type === 'select' && f.options?.length ? f.options : undefined,
      }));
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

        {canUseFeature(user ?? null, event, 'analytics') && (
          <AnalyticsWidget eventId={event.id} adminSecret={adminSecret} />
        )}

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
            {canUseFeature(user ?? null, event, 'csv_export') ? (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Export CSV
              </button>
            ) : (
              <span className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                Upgrade to export CSV
              </span>
            )}
            {canUseFeature(user ?? null, event, 'qr_code') ? (
              <a
                href={`/api/events/${event.slug}/qr`}
                download={`invy-${event.slug}-qr.png`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 inline-block"
              >
                Download QR code
              </a>
            ) : (
              <span className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                Upgrade for QR code
              </span>
            )}
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

              {canUseFeature(user ?? null, event, 'link_preview_cards') ? (
                <div>
                  <label htmlFor="og_image_url" className="block text-sm font-medium mb-2">Share image (OG)</label>
                  <input
                    type="url"
                    name="og_image_url"
                    id="og_image_url"
                    defaultValue={event.og_image_url || ''}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">URL for social share preview (1200×630 recommended)</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Share image</label>
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    Upgrade for custom share image
                  </div>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'custom_slug') ? (
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium mb-2">Custom URL</label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    defaultValue={event.slug}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="summer-bbq-2024"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">invy.rsvp/e/your-slug</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Custom URL</label>
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    Upgrade for custom URL
                  </div>
                </div>
              )}

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
                  {(canUseFeature(user ?? null, event, 'advanced_themes') ? THEME_OPTIONS : FREE_THEMES).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {canUseFeature(user ?? null, event, 'page_style') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Page style</label>
                  <div className="flex gap-2">
                    {(['classic', 'modern', 'bold'] as const).map((s) => (
                      <label key={s} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-gray-900 dark:has-[:checked]:border-white has-[:checked]:bg-gray-100 dark:has-[:checked]:bg-gray-700">
                        <input type="radio" name="page_style" value={s} defaultChecked={(event as any).page_style === s || (!(event as any).page_style && s === 'modern')} className="sr-only" />
                        <span className="text-sm capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Classic: elegant. Modern: clean. Bold: expressive.</p>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'cover_image') && (
                <ImageUploadField
                  label="Cover image"
                  imageUrl={(event as any).cover_image_url}
                  eventId={event.id}
                  adminSecret={adminSecret}
                  type="cover"
                  onUpdate={(url) => setEvent((e) => ({ ...e, cover_image_url: url }))}
                />
              )}

              {canUseFeature(user ?? null, event, 'cover_image') && (event as any).cover_image_url && (
                <div>
                  <label className="block text-sm font-medium mb-2">Cover position</label>
                  <select
                    name="cover_image_position"
                    defaultValue={(event as any).cover_image_position || 'center'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'poster_image') && (
                <ImageUploadField
                  label="Poster / card image"
                  imageUrl={(event as any).poster_image_url}
                  eventId={event.id}
                  adminSecret={adminSecret}
                  type="poster"
                  onUpdate={(url) => setEvent((e) => ({ ...e, poster_image_url: url }))}
                />
              )}

              {canUseFeature(user ?? null, event, 'capacity_limits') && (
                <div>
                  <label htmlFor="capacity_limit" className="block text-sm font-medium mb-2">Max capacity</label>
                  <input
                    type="number"
                    name="capacity_limit"
                    id="capacity_limit"
                    min={1}
                    max={10000}
                    placeholder="Optional"
                    defaultValue={event.capacity_limit ?? ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              )}

              {canUseFeature(user ?? null, event, 'guest_list_controls') && (
                <div>
                  <label htmlFor="guest_list_visibility" className="block text-sm font-medium mb-2">Guest list visibility</label>
                  <select
                    name="guest_list_visibility"
                    id="guest_list_visibility"
                    defaultValue={event.guest_list_visibility || 'host_only'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="host_only">Only you (host)</option>
                    <option value="public">Everyone can see</option>
                    <option value="attendees_only">Only attendees can see</option>
                  </select>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'request_to_attend') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">RSVP mode</label>
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-gray-900 dark:has-[:checked]:border-white has-[:checked]:bg-gray-100 dark:has-[:checked]:bg-gray-700">
                        <input type="radio" name="rsvp_mode" value="instant" defaultChecked={((event as any).rsvp_mode || 'instant') === 'instant'} className="sr-only" />
                        <span className="text-sm">Instant</span>
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 has-[:checked]:border-gray-900 dark:has-[:checked]:border-white has-[:checked]:bg-gray-100 dark:has-[:checked]:bg-gray-700">
                        <input type="radio" name="rsvp_mode" value="request" defaultChecked={(event as any).rsvp_mode === 'request'} className="sr-only" />
                        <span className="text-sm">Request</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Instant: guests confirmed immediately. Request: you approve who gets in.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="hide_location_until_approved" defaultChecked={(event as any).hide_location_until_approved} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
                    Hide exact location until approved
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="hide_private_note_until_approved" defaultChecked={(event as any).hide_private_note_until_approved} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
                    Hide private note until approved
                  </label>
                  <div>
                    <label htmlFor="private_note" className="block text-sm font-medium mb-2">Private note (for approved guests)</label>
                    <textarea name="private_note" id="private_note" rows={3} placeholder="Access code, final instructions, etc." defaultValue={(event as any).private_note || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
                  </div>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'email_reminders') && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="send_reminder_1_day"
                    defaultChecked={event.send_reminder_1_day}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  Send reminder email 1 day before event
                </label>
              )}

              {canUseFeature(user ?? null, event, 'white_label') && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="hide_branding"
                    defaultChecked={event.hide_branding}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  Hide &quot;Powered by INVY&quot; on event page and in emails
                </label>
              )}

              {canUseFeature(user ?? null, event, 'share_controls') && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="custom_share_message" className="block text-sm font-medium mb-2">Custom share message</label>
                    <textarea
                      name="custom_share_message"
                      id="custom_share_message"
                      rows={2}
                      placeholder="e.g. You're invited to my birthday party!"
                      defaultValue={event.custom_share_message || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used when sharing via native share (e.g. on mobile)</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="hide_branding_in_share"
                      defaultChecked={event.hide_branding_in_share}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    Hide INVY branding in share preview
                  </label>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'organizer_contact') ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="show_organizer_contact"
                      defaultChecked={(event as any).show_organizer_contact}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    Show organizer contact info on event page
                  </label>
                  <div className="pl-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-700">
                    <input
                      type="email"
                      name="organizer_contact_email"
                      placeholder="Contact email (optional)"
                      defaultValue={(event as any).organizer_contact_email || ''}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      name="organizer_contact_phone"
                      placeholder="Phone (optional)"
                      defaultValue={(event as any).organizer_contact_phone || ''}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      name="organizer_contact_instagram"
                      placeholder="Instagram @handle or URL (optional)"
                      defaultValue={(event as any).organizer_contact_instagram || ''}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      name="organizer_contact_whatsapp"
                      placeholder="WhatsApp number or link (optional)"
                      defaultValue={(event as any).organizer_contact_whatsapp || ''}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      name="organizer_contact_text"
                      placeholder="e.g. Questions? Message the organizer. (optional)"
                      defaultValue={(event as any).organizer_contact_text || ''}
                      maxLength={200}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Organizer contact section</label>
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    Upgrade to Pro to add organizer contact details to your event page.
                  </div>
                </div>
              )}

              {canUseFeature(user ?? null, event, 'custom_rsvp_fields') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom RSVP {event.keep_live ? 'question' : 'fields'}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {event.keep_live
                      ? 'Add one extra question to your RSVP form (e.g. dietary preferences).'
                      : 'Add extra questions to your RSVP form (e.g. dietary preferences, t-shirt size).'}
                  </p>
                  <div className="space-y-3">
                    {editedCustomFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex flex-wrap gap-2 items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <input
                          type="text"
                          placeholder="Label"
                          value={field.label}
                          onChange={(e) =>
                            setEditedCustomFields((prev) =>
                              prev.map((p) => (p.id === field.id ? { ...p, label: e.target.value } : p))
                            )
                          }
                          className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                        />
                        <select
                          value={field.type}
                          onChange={(e) =>
                            setEditedCustomFields((prev) =>
                              prev.map((p) =>
                                p.id === field.id
                                  ? { ...p, type: e.target.value as CustomRsvpField['type'] }
                                  : p
                              )
                            )
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="select">Select</option>
                        </select>
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required ?? false}
                            onChange={(e) =>
                              setEditedCustomFields((prev) =>
                                prev.map((p) =>
                                  p.id === field.id ? { ...p, required: e.target.checked } : p
                                )
                              )
                            }
                            className="h-4 w-4 rounded"
                          />
                          Required
                        </label>
                        {field.type === 'select' && (
                          <input
                            type="text"
                            placeholder="Options (comma-separated)"
                            value={(field.options || []).join(', ')}
                            onChange={(e) =>
                              setEditedCustomFields((prev) =>
                                prev.map((p) =>
                                  p.id === field.id
                                    ? {
                                        ...p,
                                        options: e.target.value
                                          .split(',')
                                          .map((o) => o.trim())
                                          .filter(Boolean),
                                      }
                                    : p
                                )
                              )
                            }
                            className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setEditedCustomFields((prev) => prev.filter((p) => p.id !== field.id))
                          }
                          className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {(!event.keep_live || editedCustomFields.length < 1) && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditedCustomFields((prev) => [
                          ...prev,
                          {
                            id: crypto.randomUUID(),
                            label: '',
                            type: 'text' as const,
                            required: false,
                          },
                        ])
                      }
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                    >
                      + Add {event.keep_live ? 'question' : 'field'}
                    </button>
                    )}
                  </div>
                </div>
              )}

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
        {(event as any).rsvp_mode === 'request' ? (
          <RsvpListWithApproval
            rsvps={rsvps}
            customRsvpFields={event.custom_rsvp_fields || []}
            eventId={event.id}
            adminSecret={adminSecret}
            capacityLimit={event.capacity_limit}
            confirmedCount={stats.estimatedGuests}
          />
        ) : (
          <RsvpList rsvps={rsvps} customRsvpFields={event.custom_rsvp_fields || []} />
        )}

        {/* Upgrade — hide when user has Organizer Hub (already has Pro+Business on all events) */}
        {event.plan_tier === 'free' && getEffectiveTier(user ?? null, event) !== 'business' && (
          <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-2">Upgrade this event</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save your page, export your guest list, or make it yours with Pro features.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!event.keep_live && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                <p className="font-medium">{MVP_PRICING.plus.label}</p>
                <p className="text-2xl font-bold">€{MVP_PRICING.plus.price}</p>
                <p className="text-xs text-gray-500 mb-3">per event — keep it live, export, add one question</p>
                <UpgradeButton
                  tier="keep"
                  eventId={event.id}
                  adminSecret={adminSecret}
                  onError={setError}
                />
              </div>
              )}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                <p className="font-medium">{MVP_PRICING.proEvent.label}</p>
                <p className="text-2xl font-bold">€{MVP_PRICING.proEvent.price}</p>
                <p className="text-xs text-gray-500 mb-3">per event — Pro features</p>
                <UpgradeButton
                  tier="pro_event"
                  eventId={event.id}
                  adminSecret={adminSecret}
                  onError={setError}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/pricing" className="text-gray-900 dark:text-gray-100 underline">
                See all plans
              </Link>
              {' · '}
              <Link href="/dashboard/billing" className="text-gray-900 dark:text-gray-100 underline">
                Organizer Hub
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

