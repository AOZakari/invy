'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function CreatedPageContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState<'public' | 'admin' | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const slug = searchParams.get('slug');
  const adminSecret = searchParams.get('adminSecret');

  const publicUrl = slug && baseUrl ? `${baseUrl}/e/${slug}` : '';
  const adminUrl = adminSecret && baseUrl ? `${baseUrl}/admin/${adminSecret}` : '';

  const copyToClipboard = async (text: string, type: 'public' | 'admin') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!slug || !adminSecret) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Link href="/create" className="text-blue-600 hover:underline">
            Create a new event
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Your INVY is ready!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your event link with guests, and save your admin link to manage RSVPs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Share your event:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(publicUrl, 'public')}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {copied === 'public' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <Link
                href={publicUrl}
                target="_blank"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
              >
                Preview your event →
              </Link>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                Manage your event (save this link!):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={adminUrl}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(adminUrl, 'admin')}
                  className="px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {copied === 'admin' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-2">
                ⚠️ We've also emailed you this link. Don't lose it!
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CreatedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </main>
    }>
      <CreatedPageContent />
    </Suspense>
  );
}
