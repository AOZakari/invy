import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Event not found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This event doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to home
        </Link>
      </div>
    </main>
  );
}

