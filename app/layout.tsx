import type { Metadata } from 'next';
import './globals.css';
import FooterWrapper from '@/components/FooterWrapper';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'INVY — Collect RSVPs in seconds, no signups, no bullshit.',
  description: 'Create beautiful RSVP pages in under 60 seconds. No login required.',
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/apple-icon-180x180.png',
  },
  manifest: '/icons/manifest.json',
  openGraph: {
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <FooterWrapper />
      </body>
    </html>
  );
}

