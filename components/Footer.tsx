import Link from 'next/link';

interface FooterProps {
  /** Minimal footer for event pages (fewer links) */
  minimal?: boolean;
}

export default function Footer({ minimal = false }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
            Terms
          </Link>
          <a href="mailto:contact@invy.rsvp" className="hover:text-gray-900 dark:hover:text-white">
            Contact
          </a>
          {!minimal && (
            <>
              <Link href="/create" className="hover:text-gray-900 dark:hover:text-white">
                Create Event
              </Link>
              <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white">
                Pricing
              </Link>
            </>
          )}
        </div>
        <p>Powered by INVY</p>
      </div>
    </footer>
  );
}
