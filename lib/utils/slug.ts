/**
 * Generate a random, URL-safe slug for events
 * Format: 8 random alphanumeric characters (lowercase)
 * Example: "a7x9k2m4"
 */
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/**
 * Validate slug format (alphanumeric, lowercase, hyphens, 3-50 chars)
 * Used for custom slugs (Pro+)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,49}$/.test(slug) && !slug.endsWith('-');
}

