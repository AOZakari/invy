import { getUserFromSession } from '@/lib/auth/user';
import { canUseFeature } from '@/lib/permissions/capabilities';
import CreateEventForm from '@/components/CreateEventForm';

export default async function CreatePage() {
  const user = await getUserFromSession();
  const fakeEvent = { plan_tier: 'free' as const } as { plan_tier: 'free' };
  const hasCustomSlugAccess = canUseFeature(user, fakeEvent, 'custom_slug');
  const hasAdvancedThemes = canUseFeature(user, fakeEvent, 'advanced_themes');

  return <CreateEventForm hasCustomSlugAccess={hasCustomSlugAccess} hasAdvancedThemes={hasAdvancedThemes} />;
}
