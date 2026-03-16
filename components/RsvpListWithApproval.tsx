'use client';

import { useState } from 'react';
import type { RSVP, CustomRsvpField } from '@/types/database';

interface RsvpListWithApprovalProps {
  rsvps: RSVP[];
  customRsvpFields?: CustomRsvpField[];
  eventId: string;
  adminSecret: string;
  capacityLimit: number | null;
  confirmedCount: number;
}

function formatCustomValue(val: string | number | boolean | undefined): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
}

type FilterTab = 'pending' | 'approved' | 'declined' | 'all';

export default function RsvpListWithApproval({
  rsvps,
  customRsvpFields = [],
  eventId,
  adminSecret,
  capacityLimit,
  confirmedCount,
}: RsvpListWithApprovalProps) {
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const pending = rsvps.filter((r) => r.status === 'pending');
  const approved = rsvps.filter((r) => r.status === 'approved' || r.status === 'yes');
  const declined = rsvps.filter((r) => r.status === 'declined');

  const filtered =
    filter === 'pending' ? pending : filter === 'approved' ? approved : filter === 'declined' ? declined : rsvps;

  const customHeaders = customRsvpFields.map((f) => f.label);
  const spotsLeft = capacityLimit != null && capacityLimit > 0 ? Math.max(0, capacityLimit - confirmedCount) : null;

  async function updateStatus(rsvpId: string, status: 'approved' | 'declined') {
    setLoading(rsvpId);
    try {
      const res = await fetch(`/api/manage/events/${eventId}/rsvps/${rsvpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_secret: adminSecret, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(null);
    }
  }

  async function bulkAction(action: 'approve' | 'decline') {
    if (selected.size === 0) return;
    const msg = action === 'approve'
      ? `Approve ${selected.size} request${selected.size === 1 ? '' : 's'}?`
      : `Decline ${selected.size} request${selected.size === 1 ? '' : 's'}?`;
    if (!confirm(msg)) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`/api/manage/events/${eventId}/rsvps/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_secret: adminSecret,
          rsvp_ids: [...selected],
          action,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBulkLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    const pendingIds = filtered.filter((r) => r.status === 'pending').map((r) => r.id);
    setSelected((prev) => {
      const next = new Set(prev);
      pendingIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const statusLabel = (s: string) => {
    if (s === 'pending') return 'Pending';
    if (s === 'approved' || s === 'yes') return 'Approved';
    if (s === 'declined' || s === 'no') return s === 'declined' ? 'Declined' : 'No';
    return s === 'maybe' ? 'Maybe' : s;
  };

  const statusColor = (s: string) => {
    if (s === 'pending') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
    if (s === 'approved' || s === 'yes') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (s === 'declined' || s === 'no') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
  };

  if (rsvps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
        No requests yet. Share your event link to start collecting responses!
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold">Requests & RSVPs</h2>
        <div className="flex gap-2">
          {(['pending', 'approved', 'declined', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                filter === tab
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
              {tab === 'pending' && pending.length > 0 && ` (${pending.length})`}
              {tab === 'approved' && approved.length > 0 && ` (${approved.length})`}
              {tab === 'declined' && declined.length > 0 && ` (${declined.length})`}
            </button>
          ))}
        </div>
      </div>

      {spotsLeft !== null && filter === 'pending' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining
        </p>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={() => bulkAction('approve')}
            disabled={bulkLoading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => bulkAction('decline')}
            disabled={bulkLoading}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {filter === 'pending' && <th className="w-10 py-3 px-2"><input type="checkbox" onChange={(e) => e.target.checked ? selectAllVisible() : setSelected(new Set())} className="rounded" /></th>}
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Contact</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">+1</th>
              {customHeaders.map((h) => (
                <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
              ))}
              <th className="text-left py-3 px-4 font-medium">Date</th>
              {filter === 'pending' && <th className="text-left py-3 px-4 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((rsvp) => (
              <tr key={rsvp.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {filter === 'pending' && (
                  <td className="py-3 px-2">
                    {rsvp.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selected.has(rsvp.id)}
                        onChange={() => toggleSelect(rsvp.id)}
                        className="rounded"
                      />
                    )}
                  </td>
                )}
                <td className="py-3 px-4 font-medium">{rsvp.name || '—'}</td>
                <td className="py-3 px-4">{rsvp.contact_info}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor(rsvp.status)}`}>
                    {statusLabel(rsvp.status)}
                  </span>
                </td>
                <td className="py-3 px-4">{rsvp.plus_one > 0 ? `+${rsvp.plus_one}` : '—'}</td>
                {customRsvpFields.map((f) => (
                  <td key={f.id} className="py-3 px-4">{formatCustomValue(rsvp.custom_field_values?.[f.id]) || '—'}</td>
                ))}
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                  {new Date(rsvp.created_at).toLocaleDateString()}
                </td>
                {filter === 'pending' && rsvp.status === 'pending' && (
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(rsvp.id, 'approved')}
                        disabled={!!loading}
                        className="text-green-600 dark:text-green-400 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        {loading === rsvp.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => updateStatus(rsvp.id, 'declined')}
                        disabled={!!loading}
                        className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
