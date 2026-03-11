import { NextRequest, NextResponse } from 'next/server';

/**
 * Retention / cleanup cron stub.
 *
 * When enabled (e.g. via Vercel Cron), this route should:
 * 1. Verify CRON_SECRET in Authorization header or query.
 * 2. Find events where starts_at + 30 days < now.
 * 3. For those events, either:
 *    - set rsvps.anonymized_at = now() (if column exists), or
 *    - delete/anonymize PII in rsvps (name, contact_info).
 * 4. Optionally mark or hide expired events (event expiry is already
 *    computed in app as starts_at + 7 days; no DB column required).
 *
 * Not implemented: actual DB updates. Add when ready.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Retention cron stub. Wire to DB cleanup when ready.',
  });
}
