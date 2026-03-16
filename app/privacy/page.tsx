import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — INVY',
  description: 'How INVY collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-block mb-8">
          ← Back to INVY
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">What we collect</h2>
            <p>
              When you create an event, we collect your email address and the event details (title, date, location, description).
              When guests RSVP, we collect their email address and optionally their name, plus their response (going, maybe, not going).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">How we use it</h2>
            <p>
              We use your email to send you the manage link for your event and to notify you when someone RSVPs (if you enable that).
              We use guest emails to send RSVP confirmations. We do not sell your data to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Data retention</h2>
            <p>
              Free events expire 7 days after the event date. After that, the event page shows that the event has ended.
              We keep event and RSVP data only as long as needed to provide the service. Paid tiers may have different retention.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Cookies and accounts</h2>
            <p>
              If you sign up for a dashboard account, we use cookies to keep you logged in. We use standard analytics to understand how the site is used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Contact</h2>
            <p>
              Questions about privacy? Email us at{' '}
              <a href="mailto:contact@invy.rsvp" className="text-gray-900 dark:text-white underline hover:no-underline">
                contact@invy.rsvp
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
