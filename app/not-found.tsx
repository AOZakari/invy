import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-gray-950">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/create"
          className="px-6 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
        >
          Create event
        </Link>
      </div>
    </main>
  );
}
