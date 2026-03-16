import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — INVY',
  description: 'Terms of use for INVY.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-block mb-8">
          ← Back to INVY
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Acceptable use</h2>
            <p>
              You may use INVY to create event pages and collect RSVPs. You agree not to use the service for spam,
              harassment, illegal activities, or to collect data for purposes other than managing your events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Your content</h2>
            <p>
              You own the content you create (event details, etc.). By using INVY, you grant us the rights needed to
              operate the service (e.g. storing and displaying your events, sending emails).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Service availability</h2>
            <p>
              We strive to keep INVY available but do not guarantee uptime. We may change or discontinue features with notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Limitation of liability</h2>
            <p>
              INVY is provided &quot;as is.&quot; We are not liable for indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-2">Contact</h2>
            <p>
              Questions? Email us at{' '}
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
