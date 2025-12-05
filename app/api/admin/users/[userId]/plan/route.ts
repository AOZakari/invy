import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/user';
import { isSuperAdmin } from '@/lib/permissions/capabilities';
import { updateUserPlanTier } from '@/lib/db/users';

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
    const { plan_tier } = body;

    if (!plan_tier || !['free', 'pro', 'business'].includes(plan_tier)) {
      return NextResponse.json({ error: 'Invalid plan_tier' }, { status: 400 });
    }

    const updatedUser = await updateUserPlanTier(userId, plan_tier);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update plan' },
      { status: 500 }
    );
  }
}

