import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth/user';
import { isSuperAdmin } from '@/lib/permissions/capabilities';
import AdminNav from '@/components/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();
  
  if (!user) {
    redirect('/login');
  }

  // Check if user is super-admin
  if (!isSuperAdmin(user)) {
    redirect('/dashboard');
  }

  // Double-check with environment variable (extra security)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'zak@aozakari.com';
  if (user.email !== superAdminEmail) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

