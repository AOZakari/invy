import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/user';
import { isSuperAdmin } from '@/lib/permissions/capabilities';
import { deleteUser, getUserById } from '@/lib/db/users';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromSession();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await context.params;

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the protected super-admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'zak@aozakari.com';
    if (targetUser.email === superAdminEmail) {
      return NextResponse.json(
        { error: 'Cannot delete the super-admin account' },
        { status: 400 }
      );
    }

    await deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}
