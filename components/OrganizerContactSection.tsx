'use client';

import type { Theme } from '@/types/database';
import { getThemeClasses } from '@/lib/utils/themes';
import { getThemePreset, RADIUS_CLASSES } from '@/lib/utils/presets';
import { toInstagramUrl, toWhatsAppUrl } from '@/lib/utils/organizer-contact';

interface OrganizerContactSectionProps {
  email: string | null;
  phone: string | null;
  instagram: string | null;
  whatsapp: string | null;
  customText: string | null;
  theme: Theme;
}

export default function OrganizerContactSection({
  email,
  phone,
  instagram,
  whatsapp,
  customText,
  theme,
}: OrganizerContactSectionProps) {
  const themeClasses = getThemeClasses(theme);
  const preset = getThemePreset(theme);
  const radiusClass = RADIUS_CLASSES[preset.radius];
  const hasEmail = email?.trim();
  const hasPhone = phone?.trim();
  const hasInstagram = instagram?.trim();
  const hasWhatsapp = whatsapp?.trim();
  const hasCustomText = customText?.trim();

  if (!hasEmail && !hasPhone && !hasInstagram && !hasWhatsapp && !hasCustomText) {
    return null;
  }

  return (
    <div className={`mt-6 p-4 ${radiusClass} border ${preset.surface} ${preset.border}`}>
      <p className="text-sm font-medium mb-3">Questions? Contact the organizer</p>
      {hasCustomText && <p className={`text-sm mb-3 ${themeClasses.muted}`}>{customText}</p>}
      <div className="flex flex-wrap gap-3">
        {hasEmail && (
          <a
            href={`mailto:${email}`}
            className={`text-sm ${themeClasses.accent} hover:underline`}
          >
            {email}
          </a>
        )}
        {hasPhone && (
          <a
            href={`tel:${phone!.replace(/\s/g, '')}`}
            className={`text-sm ${themeClasses.accent} hover:underline`}
          >
            {phone}
          </a>
        )}
        {hasInstagram && (
          <a
            href={toInstagramUrl(instagram!)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${themeClasses.accent} hover:underline`}
          >
            {instagram!.startsWith('http') ? instagram : `@${instagram!.replace(/^@/, '')}`}
          </a>
        )}
        {hasWhatsapp && (
          <a
            href={toWhatsAppUrl(whatsapp!)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${themeClasses.accent} hover:underline`}
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
