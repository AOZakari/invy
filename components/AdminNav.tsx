'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/database';

interface AdminNavProps {
  user: User;
}

export default function AdminNav({ user }: AdminNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="bg-red-600 dark:bg-red-800 border-b border-red-700 dark:border-red-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              INVY Admin
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-red-100 hover:text-white"
              >
                Overview
              </Link>
              <Link
                href="/admin/users"
                className="text-sm text-red-100 hover:text-white"
              >
                Users
              </Link>
              <Link
                href="/admin/events"
                className="text-sm text-red-100 hover:text-white"
              >
                Events
              </Link>
              <Link
                href="/admin/rsvps"
                className="text-sm text-red-100 hover:text-white"
              >
                RSVPs
              </Link>
              <Link
                href="/admin/logs"
                className="text-sm text-red-100 hover:text-white"
              >
                Logs
              </Link>
              <Link
                href="/admin/search"
                className="text-sm text-red-100 hover:text-white"
              >
                Search
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-red-100 hover:text-white"
            >
              User Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-100 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

