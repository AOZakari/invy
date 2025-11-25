'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      location_text: formData.get('location_text') as string,
      location_url: formData.get('location_url') as string,
      organizer_email: formData.get('organizer_email') as string,
      theme: (formData.get('theme') as string) || 'light',
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      // Redirect to success page with event data
      router.push(`/created?slug=${result.slug}&adminSecret=${result.adminSecret}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold mt-4">Create your INVY</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill out the form below. No account needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Summer BBQ 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location_text" className="block text-sm font-medium mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location_text"
              name="location_text"
              required
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div>
            <label htmlFor="location_url" className="block text-sm font-medium mb-2">
              Map Link (optional)
            </label>
            <input
              type="url"
              id="location_url"
              name="location_url"
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Google Maps, Apple Maps, or any location URL
            </p>
          </div>

          <div>
            <label htmlFor="organizer_email" className="block text-sm font-medium mb-2">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="organizer_email"
              name="organizer_email"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="you@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll send you the admin link here
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Tell your guests what to expect..."
            />
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium mb-2">
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create your INVY'}
          </button>
        </form>
      </div>
    </main>
  );
}
