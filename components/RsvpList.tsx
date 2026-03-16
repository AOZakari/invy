import type { RSVP, CustomRsvpField } from '@/types/database';

interface RsvpListProps {
  rsvps: RSVP[];
  customRsvpFields?: CustomRsvpField[];
}

function formatCustomValue(val: string | number | boolean | undefined): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
}

export default function RsvpList({ rsvps, customRsvpFields = [] }: RsvpListProps) {
  if (rsvps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
        No RSVPs yet. Share your event link to start collecting responses!
      </div>
    );
  }

  const customHeaders = customRsvpFields.map((f) => f.label);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-lg font-semibold mb-4">RSVPs ({rsvps.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Contact</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">+1</th>
              {customHeaders.map((h) => (
                <th key={h} className="text-left py-3 px-4 font-medium">
                  {h}
                </th>
              ))}
              <th className="text-left py-3 px-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((rsvp) => (
              <tr
                key={rsvp.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 px-4 font-medium">{rsvp.name}</td>
                <td className="py-3 px-4">{rsvp.contact_info}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      rsvp.status === 'yes'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : rsvp.status === 'maybe'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {rsvp.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">{rsvp.plus_one > 0 ? `+${rsvp.plus_one}` : '-'}</td>
                {customRsvpFields.map((f) => (
                  <td key={f.id} className="py-3 px-4">
                    {formatCustomValue(rsvp.custom_field_values?.[f.id])}
                  </td>
                ))}
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                  {new Date(rsvp.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

