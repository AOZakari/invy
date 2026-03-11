/**
 * Generate an ICS (iCalendar) file content for adding event to calendar
 */
export function generateICS(data: {
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  location?: string;
  locationUrl?: string;
}): string {
  const { title, description, start, end, location, locationUrl } = data;

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escape = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INVY//RSVP Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@invy.rsvp`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `SUMMARY:${escape(title)}`,
  ];

  if (end) {
    lines.push(`DTEND:${formatDate(end)}`);
  }

  if (description) {
    lines.push(`DESCRIPTION:${escape(description)}`);
  }

  if (location) {
    let locationLine = `LOCATION:${escape(location)}`;
    if (locationUrl) {
      locationLine += `\\n${locationUrl}`;
    }
    lines.push(locationLine);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

