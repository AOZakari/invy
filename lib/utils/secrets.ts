import { randomBytes } from 'crypto';

/**
 * Generate a secure 32-character hex string for admin secrets
 * Example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 */
export function generateAdminSecret(): string {
  return randomBytes(16).toString('hex');
}

