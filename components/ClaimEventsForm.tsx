'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/database';

interface ClaimEventsFormProps {
  events: Event[];
  userId: string;
}

export default function ClaimEventsForm({ events, userId }: ClaimEventsFormProps) {
  const router = useRouter();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  async function handleClaim(eventId: string) {
    setIsClaiming(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to claim event');
      }

      setClaimedIds((prev) => new Set([...prev, eventId]));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsClaiming(false);
    }
  }

  async function handleClaimAll() {
    setIsClaiming(true);
    setError(null);

    try {
      const unclaimed = events.filter((e) => !claimedIds.has(e.id));
      await Promise.all(
        unclaimed.map((event) =>
          fetch(`/api/events/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event.id }),
          })
        )
      );

      setClaimedIds(new Set(events.map((e) => e.id)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsClaiming(false);
    }
  }

  const remainingEvents = events.filter((e) => !claimedIds.has(e.id));

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {remainingEvents.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClaimAll}
            disabled={isClaiming}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isClaiming ? 'Claiming...' : `Claim All (${remainingEvents.length})`}
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {events.map((event) => {
          const isClaimed = claimedIds.has(event.id);
          const isClaimingThis = isClaiming && !isClaimed;

          return (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Event date: {new Date(event.starts_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4">
                  {isClaimed ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-sm font-medium">
                      Claimed ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(event.id)}
                      disabled={isClaimingThis}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {isClaimingThis ? 'Claiming...' : 'Claim'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {remainingEvents.length === 0 && events.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded text-center">
          All events claimed! You can now manage them from your dashboard.
        </div>
      )}
    </div>
  );
}

