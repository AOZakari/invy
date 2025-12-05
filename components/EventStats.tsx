import type { RsvpStats } from '@/lib/db/rsvps';

interface EventStatsProps {
  stats: RsvpStats;
}

export default function EventStats({ stats }: EventStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total RSVPs</div>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold">{stats.yes}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Yes</div>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold">{stats.maybe}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Maybe</div>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold">{stats.no}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">No</div>
      </div>
      {stats.estimatedGuests > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 col-span-2 md:col-span-4">
          <div className="text-2xl font-bold">~{stats.estimatedGuests}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Guests</div>
        </div>
      )}
    </div>
  );
}

