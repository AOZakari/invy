'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/database';

const SUPER_ADMIN_EMAIL = 'zak@aozakari.com';

interface UserActionsProps {
  user: User;
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleDelete() {
    if (
      !confirm(
        `Permanently delete ${user.email}? Their events will become unclaimed. This cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete user');
      }

      router.refresh();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
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
      {user.email !== SUPER_ADMIN_EMAIL && (
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
      {user.email !== SUPER_ADMIN_EMAIL && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs px-2 py-1 border border-red-300 dark:border-red-600 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
        >
          {isDeleting ? '…' : 'Delete'}
        </button>
      )}
    </div>
  );
}

