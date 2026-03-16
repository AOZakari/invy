'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  if (success === 'true') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded text-sm">
        Payment successful. Thank you!
      </div>
    );
  }
  if (canceled === 'true') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2 rounded text-sm">
        Payment canceled. No charges were made.
      </div>
    );
  }
  return null;
}

export default function BillingSuccess() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessContent />
    </Suspense>
  );
}
