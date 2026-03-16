import Link from 'next/link';
import { PLANS, COMPARISON_ROWS, FAQ_ITEMS } from '@/lib/pricing';

export const metadata = {
  title: 'Pricing — INVY',
  description: 'Simple pricing for fast, beautiful event pages. Start free, upgrade when you need more.',
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Simple pricing for fast, beautiful event pages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Start free in seconds. Upgrade only when you want more control, a better-looking page, or tools for repeat hosting.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            No signup friction. No bloated event software. Just clean RSVP pages that work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start free
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              See plans
            </a>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section id="plans" className="px-6 py-12 md:py-16 scroll-mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const isPro = plan.id === 'pro_event';
              const isHub = plan.id === 'organizer_hub';
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-6 flex flex-col ${
                    isPro
                      ? 'border-gray-900 dark:border-white ring-2 ring-gray-900 dark:ring-white'
                      : isHub
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded">
                      {plan.badge}
                    </span>
                  )}
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    {plan.eyebrow}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : `€${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        / {plan.period === 'event' ? 'event' : 'month'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">
                    {plan.description}
                  </p>
                  <Link
                    href={plan.ctaHref ?? '/create'}
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isPro
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                        : plan.id === 'free'
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  {(plan.id === 'plus' || plan.id === 'pro_event') && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Upgrade from your event&apos;s manage page
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-12 md:py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 pr-4 font-medium text-gray-900 dark:text-white">Feature</th>
                <th className="py-3 px-2 text-center font-medium text-gray-900 dark:text-white">Free</th>
                <th className="py-3 px-2 text-center font-medium text-gray-900 dark:text-white">Plus €2.99</th>
                <th className="py-3 px-2 text-center font-medium text-gray-900 dark:text-white">Pro €5.99</th>
                <th className="py-3 px-2 text-center font-medium text-gray-900 dark:text-white">Hub €15.99/mo</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{row.feature}</td>
                  <td className="py-3 px-2 text-center">
                    {row.free ? (
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.plus ? (
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.pro ? (
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {row.hub ? (
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why pay */}
      <section className="px-6 py-12 md:py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pay only when you want more polish or more control
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            INVY is free for simple events. Upgrade when you want to keep a page live, make it feel more personal, or run events more professionally without switching to bloated event software.
          </p>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Faster than traditional event tools</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Better-looking than generic invite links</span>
            </li>
            <li className="flex gap-2">
              <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Lightweight enough for casual hosts, powerful enough for repeat organizers</span>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 md:py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">FAQ</h2>
          <dl className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-gray-900 dark:text-white">{item.q}</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 md:py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Create your event in seconds
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start free, then upgrade only if you need more.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}
