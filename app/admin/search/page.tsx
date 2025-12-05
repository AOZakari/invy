'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search across users, events, and RSVPs
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email, slug, event title..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results && (
        <div className="space-y-6">
          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Users ({results.users.length})</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-2">
                {results.users.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    {user.email}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.events && results.events.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Events ({results.events.length})</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-2">
                {results.events.map((event: any) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    {event.title} ({event.slug})
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results && (!results.users || results.users.length === 0) && (!results.events || results.events.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

