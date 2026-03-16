import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-16 md:py-24">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 dark:text-white">
            INVY
          </h1>
          <p className="text-xl md:text-3xl text-gray-700 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Collect RSVPs in seconds.
            <br />
            <span className="text-gray-500 dark:text-gray-400">No signup. No app. No nonsense.</span>
          </p>
          <div className="pt-4 flex flex-wrap gap-3 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-900 dark:text-white border-2 border-gray-900 dark:border-white rounded-lg font-semibold text-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
            >
              Create your event
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-5 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-base font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 dark:border-gray-800 px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            How it works
          </h2>
          <ol className="space-y-8">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Create</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Add title, date, location, and your email. No account required. You get a shareable link and a private manage link by email.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Share</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Send the event link to guests. They RSVP in seconds—email required, name optional. No signup for them either.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Manage</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Use the link we emailed you to view RSVPs, edit the event, export to CSV, or close responses. Create first, manage later.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-gray-200 dark:border-gray-800 px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            Why INVY
          </h2>
          <ul className="grid sm:grid-cols-2 gap-6">
            <li className="flex flex-col gap-1">
              <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Mobile-first</span>
              <p className="text-gray-800 dark:text-gray-200">Built for phones. Your guests RSVP without pinching or scrolling through clutter.</p>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">No signup</span>
              <p className="text-gray-800 dark:text-gray-200">You create in one flow. Guests reply with email and a click. No passwords or accounts.</p>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Manage by email</span>
              <p className="text-gray-800 dark:text-gray-200">Your private manage link is sent to your inbox. Use it anytime to edit or export.</p>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Lightweight</span>
              <p className="text-gray-800 dark:text-gray-200">Free event pages expire 7 days after the date. Upgrade to keep them live.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 dark:border-gray-800 px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            FAQ
          </h2>
          <dl className="space-y-6">
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Do I need an account?</dt>
              <dd className="mt-1 text-gray-600 dark:text-gray-400">No. Create an event with your email and you’ll get a manage link by email. You can later sign up and claim events if you want.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Do my guests need an account?</dt>
              <dd className="mt-1 text-gray-600 dark:text-gray-400">No. They enter their email (and optional name) and choose going / maybe / not going. Confirmation is sent to their email.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">How long is my event page live?</dt>
              <dd className="mt-1 text-gray-600 dark:text-gray-400">Free events stay viewable and manageable until 7 days after the event date. After that, the page shows that the event has ended.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">What happens to RSVP data?</dt>
              <dd className="mt-1 text-gray-600 dark:text-gray-400">We use it to show you who’s coming and to send confirmations. We don’t sell it. Retention and deletion follow a short, clear policy (see privacy note below).</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Privacy / trust */}
      <section className="border-t border-gray-200 dark:border-gray-800 px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We keep event and RSVP data only as long as needed. Free events expire 7 days after the event; attendee data is handled according to a short retention policy. We don’t sell your data. Simple and transparent.
          </p>
        </div>
      </section>

      {/* CTA again */}
      <section className="border-t border-gray-200 dark:border-gray-800 px-6 py-12 text-center">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-6 py-3 text-gray-900 dark:text-white border-2 border-gray-900 dark:border-white rounded-lg font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
        >
          Create your event
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
