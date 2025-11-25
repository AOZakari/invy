import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INVY — Collect RSVPs in seconds, no signups, no bullshit.',
  description: 'Create beautiful RSVP pages in under 60 seconds. No login required.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

