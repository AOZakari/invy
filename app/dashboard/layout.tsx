import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth (Phase 6 - basic check, will be enhanced)
  // For now, we'll allow access but structure for auth
  // In production, uncomment this:
  /*
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

