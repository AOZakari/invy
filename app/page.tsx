import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">INVY</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Collect RSVPs in seconds, no signups, no bullshit.
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create your INVY
          </Link>
        </div>

        <div className="pt-12 text-sm text-gray-500">
          <p>No account needed. Free forever.</p>
        </div>
      </div>
    </main>
  );
}

