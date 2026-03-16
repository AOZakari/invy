import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getEventBySlug } from '@/lib/db/events';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const eventUrl = `${APP_URL}/e/${slug}`;

  try {
    const png = await QRCode.toBuffer(eventUrl, {
      type: 'png',
      width: 256,
      margin: 2,
    });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="invy-${slug}-qr.png"`,
      },
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
