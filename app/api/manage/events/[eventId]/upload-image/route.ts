import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getEventByAdminSecret, updateEvent } from '@/lib/db/events';
import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature, canManageEvent, canClaimEvent } from '@/lib/permissions/capabilities';

const BUCKET = 'event-images';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const adminSecret = formData.get('admin_secret') as string | null;
    const type = formData.get('type') as string | null;

    if (!file || !adminSecret || !type) {
      return NextResponse.json(
        { error: 'Missing file, admin_secret, or type (cover|poster)' },
        { status: 400 }
      );
    }

    if (!['cover', 'poster'].includes(type)) {
      return NextResponse.json({ error: 'Type must be cover or poster' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP allowed' }, { status: 400 });
    }

    const event = await getEventByAdminSecret(adminSecret);
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Invalid manage link' }, { status: 403 });
    }

    const user = await getUserFromSession();
    const effectiveUser =
      user && (canManageEvent(user, event) || canClaimEvent(user, event)) ? user : null;

    const feature = type === 'cover' ? 'cover_image' : 'poster_image';
    if (!canUseFeature(effectiveUser, event, feature)) {
      return NextResponse.json({ error: 'Upgrade to Pro for cover/poster images' }, { status: 403 });
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${eventId}/${type}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    const updatePayload = type === 'cover' ? { cover_image_url: publicUrl } : { poster_image_url: publicUrl };
    await updateEvent(eventId, updatePayload as any, adminSecret);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
