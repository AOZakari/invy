import Link from 'next/link';

export default function HomePage() {
  const highlights = [
    {
      title: 'No signups',
      copy: 'Start collecting responses the moment inspiration hits.',
    },
    {
      title: 'Live in 60 seconds',
      copy: 'Publish a clean RSVP page faster than you can open slides.',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-white dark:bg-gray-950">
      <div className="max-w-4xl w-full">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-gray-900 dark:text-white">
              INVY
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Collect RSVPs in seconds,<br />
              <span className="text-gray-500 dark:text-gray-400">no signups, no bullshit.</span>
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-900 dark:text-white border border-gray-900 dark:border-white rounded-lg font-semibold text-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
            >
              Create your INVY
              <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-16 space-y-6">
          {highlights.map((item) => (
            <div key={item.title} className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-6 last:border-b-0 last:pb-0">
              <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.title}</span>
              <p className="text-lg text-gray-800 dark:text-gray-200">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

