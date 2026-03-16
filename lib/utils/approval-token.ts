import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.APPROVAL_TOKEN_SECRET || process.env.SUPABASE_JWT_SECRET || 'invy-approval-secret';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createApprovalToken(eventId: string, email: string): string {
  const exp = Date.now() + MAX_AGE_MS;
  const payload = JSON.stringify({ eventId, email: email.toLowerCase().trim(), exp });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyApprovalToken(token: string): { eventId: string; email: string } | null {
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;
    const expectedSig = createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(sig, 'base64url');
    const expectedBuf = Buffer.from(expectedSig, 'base64url');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return { eventId: payload.eventId, email: payload.email };
  } catch {
    return null;
  }
}
