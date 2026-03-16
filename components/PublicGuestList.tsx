import type { RSVP } from '@/types/database';

interface PublicGuestListProps {
  rsvps: RSVP[];
}

export default function PublicGuestList({ rsvps }: PublicGuestListProps) {

  if (rsvps.length === 0) {
    return null;
  }

  const going = rsvps.filter((r) => r.status === 'yes' || r.status === 'approved');
  const maybe = rsvps.filter((r) => r.status === 'maybe');

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-3">Who&apos;s coming</h3>
      <div className="space-y-2">
        {going.map((r) => (
          <div key={r.id} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{r.name || 'Guest'}</span>
            {r.plus_one > 0 && (
              <span className="text-gray-500 dark:text-gray-400">+{r.plus_one}</span>
            )}
          </div>
        ))}
        {maybe.map((r) => (
          <div key={r.id} className="flex items-center gap-2 text-sm opacity-80">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{r.name || 'Guest'}</span>
            {r.plus_one > 0 && (
              <span className="text-gray-500 dark:text-gray-400">+{r.plus_one}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
