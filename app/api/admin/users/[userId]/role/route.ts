import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/user';
import { isSuperAdmin } from '@/lib/permissions/capabilities';
import { updateUserRole } from '@/lib/db/users';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromSession();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await context.params;
    const body = await request.json();
    const { role } = body;

    if (!role || !['user', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent changing your own role
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserRole(userId, role);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update role' },
      { status: 500 }
    );
  }
}

