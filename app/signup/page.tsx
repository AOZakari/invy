'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // If email confirmations are disabled, auto sign in
        // Otherwise, show success message and wait for email confirmation
        if (!data.session) {
          // Email confirmation required
          setSuccess(true);
        } else {
          // Auto signed in (email confirmations disabled)
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-white dark:bg-gray-950">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent you a confirmation link. Click it to verify your account.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            After confirming, you'll be able to sign in.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-white dark:bg-gray-950">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            INVY
          </Link>
          <h1 className="text-2xl font-bold mt-4">Create account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start managing your events in one place
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              At least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 px-6 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 dark:text-gray-100 hover:underline font-medium">
              Sign in
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/" className="hover:underline">
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

