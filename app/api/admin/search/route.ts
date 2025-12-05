import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/user';
import { isSuperAdmin } from '@/lib/permissions/capabilities';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    const searchTerm = `%${query}%`;

    // Search users by email
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .ilike('email', searchTerm)
      .limit(10);

    // Search events by slug or title
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('id, title, slug')
      .or(`slug.ilike.${searchTerm},title.ilike.${searchTerm}`)
      .limit(10);

    return NextResponse.json({
      users: users || [],
      events: events || [],
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

