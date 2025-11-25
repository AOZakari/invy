import Link from 'next/link';

export default function DashboardNav() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            INVY
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Home
            </Link>
            <Link
              href="/create"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Create Event
            </Link>
            {/* Phase 6+: Add logout button when auth is implemented */}
          </div>
        </div>
      </div>
    </nav>
  );
}

