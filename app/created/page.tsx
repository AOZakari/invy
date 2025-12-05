'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function CreatedPageContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState<'public' | 'manage' | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const slug = searchParams.get('slug');
  const adminSecret = searchParams.get('adminSecret');

  const publicUrl = slug && baseUrl ? `${baseUrl}/e/${slug}` : '';
  const manageUrl = adminSecret && baseUrl ? `${baseUrl}/manage/${adminSecret}` : '';

  const copyToClipboard = async (text: string, type: 'public' | 'manage') => {
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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-gray-950">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Nice work</p>
            <h1 className="text-3xl font-bold">Your INVY is ready</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share the guest link below and keep the manage link somewhere safe.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <label className="block text-sm font-medium mb-2">Share your event</label>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(publicUrl, 'public')}
                  className="px-4 py-2 border border-gray-900 dark:border-white rounded text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                >
                  {copied === 'public' ? '✓ Copied' : 'Copy link'}
                </button>
              </div>
              <Link
                href={publicUrl}
                target="_blank"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
              >
                Preview your event
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <label className="block text-sm font-medium mb-2">Manage your event</label>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={manageUrl}
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(manageUrl, 'manage')}
                  className="px-4 py-2 border border-gray-900 dark:border-white rounded text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
                >
                  {copied === 'manage' ? '✓ Copied' : 'Copy manage link'}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">We also emailed this link to you.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100">
                ← Back to home
              </Link>
              <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-100">
                Open dashboard
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
