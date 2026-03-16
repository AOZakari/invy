import type { RsvpStats } from '@/lib/db/rsvps';

interface EventStatsProps {
  stats: RsvpStats;
}

export default function EventStats({ stats }: EventStatsProps) {
  const hasRequests = (stats.pending ?? 0) + (stats.approved ?? 0) + (stats.declined ?? 0) > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
      </div>
      {hasRequests ? (
        <>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold">{stats.pending ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold">{(stats.yes ?? 0) + (stats.approved ?? 0)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold">{stats.declined ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Declined</div>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
      {stats.estimatedGuests > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 col-span-2 md:col-span-4">
          <div className="text-2xl font-bold">~{stats.estimatedGuests}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Guests</div>
        </div>
      )}
    </div>
  );
}

