'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/database';

interface UserActionsProps {
  user: User;
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdatePlan(planTier: 'free' | 'pro' | 'business') {
    if (user.plan_tier === planTier) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_tier: planTier }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      router.refresh();
    } catch (err) {
      console.error('Failed to update plan:', err);
      alert('Failed to update plan');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdateRole(role: 'user' | 'superadmin') {
    if (user.role === role) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      router.refresh();
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex gap-2">
      <select
        value={user.plan_tier}
        onChange={(e) => handleUpdatePlan(e.target.value as 'free' | 'pro' | 'business')}
        disabled={isUpdating}
        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="business">Business</option>
      </select>
      {user.email !== 'zak@aozakari.com' && (
        <select
          value={user.role}
          onChange={(e) => handleUpdateRole(e.target.value as 'user' | 'superadmin')}
          disabled={isUpdating}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        >
          <option value="user">User</option>
          <option value="superadmin">Super Admin</option>
        </select>
      )}
    </div>
  );
}

