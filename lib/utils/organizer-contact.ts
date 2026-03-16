/**
 * Helpers for organizer contact display
 */

/** Normalize Instagram handle or URL to full URL */
export function toInstagramUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  return `https://instagram.com/${handle}`;
}

/** Normalize WhatsApp number or link to wa.me URL */
export function toWhatsAppUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('wa.me/')) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}`;
}
