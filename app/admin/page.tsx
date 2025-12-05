import { supabaseAdmin } from '@/lib/supabase/server';
import type { User, Event, RSVP } from '@/types/database';

async function getStats() {
  const [usersResult, eventsResult, rsvpsResult] = await Promise.all([
    supabaseAdmin.from('users').select('id, plan_tier', { count: 'exact' }),
    supabaseAdmin.from('events').select('id, plan_tier', { count: 'exact' }),
    supabaseAdmin.from('rsvps').select('id', { count: 'exact' }),
  ]);

  const users = (usersResult.data || []) as Pick<User, 'id' | 'plan_tier'>[];
  const events = (eventsResult.data || []) as Pick<Event, 'id' | 'plan_tier'>[];

  const planDistribution = {
    free: users.filter((u) => u.plan_tier === 'free').length,
    pro: users.filter((u) => u.plan_tier === 'pro').length,
    business: users.filter((u) => u.plan_tier === 'business').length,
  };

  const eventPlanDistribution = {
    free: events.filter((e) => e.plan_tier === 'free').length,
    pro: events.filter((e) => e.plan_tier === 'pro').length,
    business: events.filter((e) => e.plan_tier === 'business').length,
  };

  return {
    totalUsers: usersResult.count || 0,
    totalEvents: eventsResult.count || 0,
    totalRsvps: rsvpsResult.count || 0,
    planDistribution,
    eventPlanDistribution,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          System overview and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold">{stats.totalRsvps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total RSVPs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">User Plan Distribution</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Free</span>
              <span className="font-medium">{stats.planDistribution.free}</span>
            </div>
            <div className="flex justify-between">
              <span>Pro</span>
              <span className="font-medium">{stats.planDistribution.pro}</span>
            </div>
            <div className="flex justify-between">
              <span>Business</span>
              <span className="font-medium">{stats.planDistribution.business}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Event Plan Distribution</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Free</span>
              <span className="font-medium">{stats.eventPlanDistribution.free}</span>
            </div>
            <div className="flex justify-between">
              <span>Pro</span>
              <span className="font-medium">{stats.eventPlanDistribution.pro}</span>
            </div>
            <div className="flex justify-between">
              <span>Business</span>
              <span className="font-medium">{stats.eventPlanDistribution.business}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

