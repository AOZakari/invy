'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

