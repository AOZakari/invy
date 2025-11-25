import type { RsvpStats } from '@/lib/db/rsvps';

interface EventStatsProps {
  stats: RsvpStats;
}

export default function EventStats({ stats }: EventStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total RSVPs</div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm p-4">
        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.yes}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Yes</div>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm p-4">
        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
          {stats.maybe}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Maybe</div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm p-4">
        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.no}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">No</div>
      </div>
      {stats.estimatedGuests > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm p-4 col-span-2 md:col-span-4">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ~{stats.estimatedGuests}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Guests</div>
        </div>
      )}
    </div>
  );
}

